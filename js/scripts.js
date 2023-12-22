document.addEventListener('DOMContentLoaded', function () {
   var acceptBtn = document.getElementById('acceptCookieConsent');
   var rejectBtn = document.getElementById('rejectCookies');
   var cookieConsentContainer = document.getElementById('cookieConsentContainer');

    // Function to set a cookie
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    
     function getCookie(name) {
         var nameEQ = name + "=";
         var ca = document.cookie.split(';');
         for(var i=0; i < ca.length; i++) {
             var c = ca[i];
             while (c.charAt(0) == ' ') c = c.substring(1);
             if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
         }
         return null;
     }

     if (getCookie("userConsent")) {
         cookieConsentContainer.style.display = "none";
     } else {
    cookieConsentContainer.style.display = "block";
     }


   acceptBtn.addEventListener('click', function() {
       setCookie('userConsent', 'accepted', 1);
       cookieConsentContainer.style.display = 'none';
   });

   rejectBtn.addEventListener('click', function() {
       setCookie('userConsent', 'rejected', 1);
       cookieConsentContainer.style.display = 'none';
   });
});


function makeAPICall(method, params) {
   const apiKey = 'ca21418a-b3c3-4c09-a615-f59efa8ffa80';
   const url = 'https://api.random.org/json-rpc/2/invoke';

   const payload = {
       "jsonrpc": "2.0",
       "method": method,
       "params": { ...params, "apiKey": apiKey },
       "id": 42
   };

   return fetch(url, {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify(payload)
   })
       .then(response => response.json())
       .catch(error => {
           console.error('Error:', error);
       });
}

function generateRandom() {
   const number = document.getElementById('number').value;
   const min = document.getElementById('min').value;
   const max = document.getElementById('max').value;

   makeAPICall("generateIntegers", {
       "n": number,
       "min": min,
       "max": max,
       "replacement": true
   })
       .then(data => {
           if (data && data.result && data.result.random && data.result.random.data) {
               const resultElement = document.getElementById('result');
               resultElement.innerHTML = '';
               const numbers = data.result.random.data;

               numbers.forEach(number => {
                   const div = document.createElement('div');
                   div.textContent = number;
                   div.classList.add('number-box');
                   resultElement.appendChild(div);
               });
           } else if (data.error) {
               console.error('Error:', data.error.message);
           }
       });
}

function rollDice() {
   const numberOfRolls = document.getElementById('diceNumber').value || 1;
   makeAPICall("generateIntegers", {
       "n": numberOfRolls,
       "min": 1,
       "max": 6,
       "replacement": true
   })
       .then(data => {
           if (data && data.result && data.result.random && data.result.random.data) {
               const diceResults = data.result.random.data;
               document.getElementById('diceResult').textContent = `Dice Roll Results: ${diceResults.join(', ')}`;
           } else if (data.error) {
               console.error('Error:', data.error.message);
           }
       });
}

function generateLottoNumbers() {
   const numberOfSets = parseInt(document.getElementById('lottoSets').value) || 1;
   let lottoPromises = [];

   for (let i = 0; i < numberOfSets; i++) {
       lottoPromises.push(
           makeAPICall("generateIntegers", {
               "n": 6,
               "min": 1,
               "max": 49,
               "replacement": false
           }).then(data => {
               if (data && data.result && data.result.random && data.result.random.data) {
                   return makeAPICall("generateIntegers", {
                       "n": 1,
                       "min": 0,
                       "max": 9,
                       "replacement": true
                   }).then(extraData => {
                       if (extraData && extraData.result && extraData.result.random && extraData.result.random.data) {
                           const lottoNumbers = data.result.random.data;
                           const extraNumber = extraData.result.random.data[0];
                           return `${lottoNumbers.join('-')} / ${extraNumber.toString().padStart(2, '0')}`;
                       }
                   });
               }
           })
       );
   }


   Promise.all(lottoPromises).then(allLottoResults => {
       document.getElementById('lottoResult').innerHTML = `German Lotto Numbers:<br>${allLottoResults.join('<br>')}`;
   }).catch(error => {
       console.error('Error:', error);
   });
}

function flipCoin() {
    const numberOfCoins = document.getElementById('coinNumber').value || 1;
    makeAPICall("generateIntegers", {
        "n": numberOfCoins,
        "min": 0,
        "max": 1,
        "replacement": true
    })
        .then(data => {
            if (data && data.result && data.result.random && data.result.random.data) {
                const coinResults = data.result.random.data.map(coin => coin === 0 ? "Heads" : "Tails");
                document.getElementById('coinResult').textContent = `Coin Flip Results: ${coinResults.join(', ')}`;
            } else if (data.error) {
                console.error('Error:', data.error.message);
            }
        });
}

function generateKenoNumbers() {
    const ticketCount = parseInt(document.getElementById('ticketCount').value) || 1;
    const numberCount = parseInt(document.getElementById('numberCount').value) || 1;
    const maxValue = parseInt(document.getElementById('maxValue').value);
    let kenoPromises = [];

    // Überprüfen, ob die Eingaben gültig sind
    if (ticketCount < 1 || ticketCount > 20 || numberCount < 1 || numberCount > 20) {
        alert('Please select valid numbers for tickets and numbers per ticket.');
        return;
    }

    for (let i = 0; i < ticketCount; i++) {
        kenoPromises.push(
            makeAPICall("generateIntegers", {
                "n": numberCount,
                "min": 1,
                "max": maxValue,
                "replacement": false
            }).then(data => {
                if (data && data.result && data.result.random && data.result.random.data) {
                    return data.result.random.data.join('-');
                } else {
                    throw new Error('Invalid data from API');
                }
            })
        );
    }

    Promise.all(kenoPromises).then(allKenoResults => {
        document.getElementById('kenoResult').innerHTML = `Keno Ticket Numbers:<br>${allKenoResults.join('<br>')}`;
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('kenoResult').innerHTML = 'Error generating numbers. Please try again.';
    });
}


function generateBirdieHoles() {
    const holeCount = parseInt(document.getElementById('holeCount').value) || 1;
    const courseType = document.getElementById('courseType').value;
    let maxHoleNumber, minHoleNumber;

    switch (courseType) {
        case 'front9':
            minHoleNumber = 1;
            maxHoleNumber = 9;
            break;
        case 'back9':
            minHoleNumber = 10;
            maxHoleNumber = 18;
            break;
        case '18hole':
            minHoleNumber = 1;
            maxHoleNumber = 18;
            break;
    }

    makeAPICall("generateIntegers", {
        "n": holeCount,
        "min": minHoleNumber,
        "max": maxHoleNumber,
        "replacement": false
    }).then(data => {
        if (data && data.result && data.result.random && data.result.random.data) {
            document.getElementById('randomizerResult').innerHTML = `Random Birdie Holes: ${data.result.random.data.join(', ')}`;
        } else {
            throw new Error('Invalid data from API');
        }
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('randomizerResult').innerHTML = 'Error generating holes. Please try again.';
    });
}

document.getElementById('randomizeBtn').addEventListener('click', generateBirdieHoles);



document.getElementById('kenoBtn').addEventListener('click', generateKenoNumbers);


document.getElementById('coinBtn').addEventListener('click', flipCoin);


document.getElementById('generateBtn').addEventListener('click', generateRandom);
document.getElementById('diceBtn').addEventListener('click', rollDice);
document.getElementById('lottoBtn').addEventListener('click', generateLottoNumbers);
document.getElementById('coinBtn').addEventListener('click', flipCoin);
