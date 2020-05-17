var user_token;
var answer = '';

async function getData() {
  user_token = document.getElementById("userToken").value;

  try {
    const response = await axios.get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${user_token}`);
    answer = response.data;

    document.getElementById("encryptedText").value = answer.cifrado;

    decifra();
    
  } catch(error) {
    document.getElementById("result").value = error;
  }
}

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

  document.getElementById("decryptedText").value = answer.decifrado;
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

  // console.log(answer_json);

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

    let retorno = "";
    if(response.status == 200){
      retorno = `Nota: ${response.data.score}`
    }
    else {
      retorno = `Status: ${response.status} - ${response.statusText}` 
    }

    document.getElementById("result").value = retorno;
  } catch(error) {
    document.getElementById("result").value = error;
  }
}