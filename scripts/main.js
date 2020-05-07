const user_token = 'ecc3c643bf95405ac74a00f3a8bb4c4200f25b29'; // substituir pelo token do usuário no codenation

var answer = '';

async function getData() {
  try {
    const response = await axios.get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${user_token}`);
    answer = response.data;

    decifra();
    
    await sendData();

  } catch(error) {
    console.log(error);
  }
}

getData();

function decifra() {
  const {numero_casas, cifrado} = answer;

  let alfabeto = Array.from('abcdefghijklmnopqrstuvwxyz');

  let index = 0;
  Array.from(cifrado).forEach(element => {
    index = alfabeto.indexOf(element);

    if(index < 0)
      answer.decifrado += element;
    else {
      let pos = index - numero_casas;
      if(pos < 0)
        pos = pos + 26;

      answer.decifrado += alfabeto[pos];
    }
  });
  // console.log(answer.decifrado);
}

// fonte: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

  return hashHex;
}

async function sendData() {
  answer.resumo_criptografico = await digestMessage(answer.decifrado);

  const answer_json = JSON.stringify(answer);

  console.log(answer_json);

  var file = new File([answer_json], "answer.json", {
    type: "application/json",
  });

  const form = new FormData();
  form.append('answer', file);

  try {
    const response = await axios.post(
      `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${user_token}`,
      form, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  
    console.log(response);  
  } catch(error) {
    console.log(error);
  }
}