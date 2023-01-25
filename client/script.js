import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const welcomeText = document.querySelector('#welcometext');

let loadInterval;

// loading bot message using three dots (...)
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....')
      element.textContent = '';
  }, 300)
}

// function to give typing effect of bot output
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else
      clearInterval(interval);
  }, 20);
}

// generate unique ID for each message
function generateUniqueId(element) {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalNumber = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalNumber}`;
}

// box container around each message
function chatStripe(isAI, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAI && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAI ? bot : user}"
              alt="${isAI ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
        </div>
      </div>
    `
  )
}

// submit response
const handleSubmit = async (e) => {
  e.preventDefault();
  welcomeText.innerHTML = "";
  const data = new FormData(form);

  // users chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // scroll on user type
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);


  // fetch data from server (bots response)
  const response = await fetch('https://chatgpt-mn.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval);

  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({ parsedData });

    typeText(messageDiv, parsedData);
  }
  else {
    const err = await response.json();
    const errMessage = err['error']['message'];
    if (errMessage == 'User Rate Limit Exceeded') {
      messageDiv.innerHTML = 'Өнөөдөртөө та нарын маань "үнэгүй" хэрэглэх хязгаар тулсан байна. 🥲 Маргааш 16:00 цагаас дахин хэрэглэх боломжтой учраас маргааш хүртэл хүлээгээд дахин хэрэглээрэй. (Жич: Та Англи хэлтэй бол шууд chat.openai.com руу ороод үргэлжлүүлэн хэрэглэх боломжтой шүү. Монгол хэлээр энэ системийг юу юунд хэрэглэж байгаа талаараа, өөрт төрсөн санал сэтгэгдлээ хуваалцахыг хүсвэл, эсвэл өдрийн хязгааргүй Монгол хэл дээр хэрэглэж байх талаар сонирхож байваал  amarbayar.amarsanaa@gmail.com рүү хандаарай). Та мэдэх үү? Энэ системийг ашиглаад зохион бичлэг, нийтлэл бичүүлж болно. Дүн шинжилгээ, анализ хийлгүүлж болно. Бизнесийн санаа гаргуулк, төлөвлөгөө бичүүлж болно. Ном, ярилцлагыг хураангуйлуулж болно... гээд хязгааргүй олон янзаар хэрэглэж болно шүү. Амжилт!';
    } else {
      messageDiv.innerHTML = 'Өнөөдөртөө та нарын маань "үнэгүй" хэрэглэх хязгаар тулсан байна. 🥲 Маргааш 16:00 цагаас дахин хэрэглэх боломжтой учраас маргааш хүртэл хүлээгээд дахин хэрэглээрэй. (Жич: Та Англи хэлтэй бол шууд chat.openai.com руу ороод үргэлжлүүлэн хэрэглэх боломжтой шүү. Монгол хэлээр энэ системийг юу юунд хэрэглэж байгаа талаараа, өөрт төрсөн санал сэтгэгдлээ хуваалцахыг хүсвэл, эсвэл өдрийн хязгааргүй Монгол хэл дээр хэрэглэж байх талаар сонирхож байваал  amarbayar.amarsanaa@gmail.com рүү хандаарай). Та мэдэх үү? Энэ системийг ашиглаад зохион бичлэг, нийтлэл бичүүлж болно. Дүн шинжилгээ, анализ хийлгүүлж болно. Бизнесийн санаа гаргуулк, төлөвлөгөө бичүүлж болно. Ном, ярилцлагыг хураангуйлуулж болно... гээд хязгааргүй олон янзаар хэрэглэж болно шүү. Амжилт!';
    }
  }
}

// call handleSubmit upon user submit the message
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13)
    handleSubmit(e);
})