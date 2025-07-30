// script.js 파일 - 최종 수정된 버전 (Kakao.getVersion() 오류 해결)

// ----------------------------------------------------
// 1. DOM 요소 가져오기 (HTML 요소들을 JavaScript에서 사용하기 위해)
// ----------------------------------------------------
const lottoNumbersDisplay = document.getElementById('lottoNumbers');
const pensionNumbersDisplay = document.getElementById('pensionNumbers');
const generateLottoBtn = document.getElementById('generateLottoBtn');
const generatePensionBtn = document.getElementById('generatePensionBtn');
const phoneNumberInput = document.getElementById('phoneNumber');
const sendSmsBtn = document.getElementById('sendSmsBtn');
const sendKakaoBtn = document.getElementById('sendKakaoBtn');
const statusMessageDisplay = document.getElementById('statusMessage');

// ----------------------------------------------------
// 2. Kakao SDK 초기화 (카카오톡 기능 사용을 위해 가장 먼저 실행되어야 해!)
//    여기에 카카오 개발자 사이트에서 받은 너의 'JavaScript 키'를 넣어줘!
//    예시: Kakao.init('YOUR_JAVASCRIPT_APP_KEY');
// ----------------------------------------------------
Kakao.init('2765155fedb41c320bd545d028532658'); 

// SDK 초기화 성공 여부 콘솔 확인 (개발자 도구 F12에서 확인 가능)
// 이전에 'getVersion()' 때문에 오류가 났던 부분을 수정했어!
if (Kakao.isInitialized()) {
    console.log('카카오 SDK 초기화 성공!'); // '버전:' 및 getVersion() 호출 부분 삭제
} else {
    console.error('카카오 SDK 초기화 실패! JavaScript 키를 확인해주세요.');
}

// ----------------------------------------------------
// 3. 번호 생성 함수 (현재는 프론트엔드에서 무작위로 생성)
//    **나중에 파이썬 백엔드와 연동하여 당첨 확률 로직을 넣을 거야!**
// ----------------------------------------------------

/**
 * 로또 번호 6개를 무작위로 생성합니다. (1~45, 중복 없음)
 * @returns {number[]} 생성된 로또 번호 배열 (오름차순 정렬)
 */
function generateLottoNumbers() {
    const numbers = new Set(); // 중복을 피하기 위해 Set 사용
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1); // 1부터 45까지 숫자
    }
    return Array.from(numbers).sort((a, b) => a - b); // 배열로 변환 후 오름차순 정렬
}

/**
 * 연금복권 번호를 생성합니다. (1조 ~ 5조, 6자리 숫자)
 * @returns {string} 생성된 연금복권 번호 문자열 (예: "1조123456")
 */
function generatePensionNumbers() {
    // 1조 ~ 5조 중 랜덤 선택
    const group = Math.floor(Math.random() * 5) + 1;

    // 6자리 숫자 생성 (000000 ~ 999999)
    const serial = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    return `${group}조 ${serial}`;
}

// ----------------------------------------------------
// 4. 번호 표시 함수
// ----------------------------------------------------

/**
 * 생성된 번호들을 HTML 요소에 표시합니다.
 * @param {HTMLElement} displayElement 번호가 표시될 HTML 요소
 * @param {Array<number|string>} numbers 표시할 번호 배열
 */
function displayNumbers(displayElement, numbers) {
    displayElement.innerHTML = ''; // 기존 번호 초기화 (예: '눌러봐!' 같은 플레이스홀더)

    if (numbers.length === 0) {
        displayElement.innerHTML = '<span class="placeholder">번호 생성 실패 🥲</span>';
        return;
    }

    // 각 번호를 span 태그로 만들어서 추가
    numbers.forEach(num => {
        const span = document.createElement('span');
        span.textContent = num;
        displayElement.appendChild(span);
    });
}

// ----------------------------------------------------
// 5. 상태 메시지 표시 함수
// ----------------------------------------------------

/**
 * 사용자에게 상태 메시지를 표시합니다.
 * @param {string} message 표시할 메시지 내용
 * @param {boolean} isError 오류 메시지 여부 (true면 빨간색)
 */
function showStatusMessage(message, isError = false) {
    statusMessageDisplay.textContent = message;
    if (isError) {
        statusMessageDisplay.style.color = 'red';
    } else {
        statusMessageDisplay.style.color = '#666'; // 기본 색상
    }
    // 잠시 후 메시지 사라지게
    setTimeout(() => {
        statusMessageDisplay.textContent = '';
    }, 5000); // 5초 후 사라짐
}


// ----------------------------------------------------
// 6. 이벤트 리스너 (버튼 클릭 시 실행될 동작 정의)
// ----------------------------------------------------

// 🍀 로또 번호 생성 버튼 클릭
generateLottoBtn.addEventListener('click', () => {
    const lottoNumbers = generateLottoNumbers();
    displayNumbers(lottoNumbersDisplay, lottoNumbers);
    showStatusMessage('로또 번호가 생성되었어요! 행운을 빌어요! 😄');
});

// 💰 연금복권 번호 생성 버튼 클릭
generatePensionBtn.addEventListener('click', () => {
    const pensionNumber = generatePensionNumbers();
    // 연금복권은 하나의 문자열이므로 배열에 담아서 전달
    displayNumbers(pensionNumbersDisplay, [pensionNumber]);
    showStatusMessage('연금복권 번호가 생성되었어요! 부자되세요~! 💰');
});

// 📱 SMS로 전송 버튼 클릭
sendSmsBtn.addEventListener('click', () => {
    const phoneNumber = phoneNumberInput.value.trim(); // 입력된 전화번호 가져오기
    const currentLottoNumbers = Array.from(lottoNumbersDisplay.children).map(span => span.textContent);
    const currentPensionNumber = Array.from(pensionNumbersDisplay.children).map(span => span.textContent);

    // 🔴 휴대폰 번호 유효성 검사
    if (!phoneNumber) { // 번호가 비어있는지 확인
        showStatusMessage('휴대폰 번호를 입력해주세요! 🚨', true);
        return;
    }
    // 번호 길이 (10~11자리) 및 숫자 여부 확인 (하이픈 없이 숫자만)
    if (phoneNumber.length < 10 || phoneNumber.length > 11 || !/^\d+$/.test(phoneNumber)) {
        showStatusMessage('유효한 휴대폰 번호를 입력해주세요! (숫자 10-11자리) 🚫', true);
        return;
    }
    
    // 생성된 번호가 있는지 확인 (로또 또는 연금복권 중 하나라도 있어야 함)
    if ((currentLottoNumbers.length === 0 || currentLottoNumbers.includes('눌러봐!')) && 
        (currentPensionNumber.length === 0 || currentPensionNumber.includes('눌러봐!'))) {
        showStatusMessage('생성된 번호가 없어요! 먼저 번호를 뽑아주세요! 🙏', true);
        return;
    }

    // 실제 SMS 전송은 백엔드에서 담당해야 해! (Flask/Django 파이썬 코드)
    // 여기서는 '보내는 시늉'만 하고 나중에 fetch API로 백엔드와 통신할 거야.
    showStatusMessage(`${phoneNumber} (으)로 번호를 전송 중... (실제 발송은 백엔드 연동 후 가능)`);

    console.log("SMS 전송 시뮬레이션 데이터:");
    console.log("받는 사람:", phoneNumber);
    console.log("로또 번호:", currentLottoNumbers.includes('눌러봐!') ? '없음' : currentLottoNumbers);
    console.log("연금복권 번호:", currentPensionNumber.includes('눌러봐!') ? '없음' : currentPensionNumber);

    // 나중에 백엔드 연동 시 아래 fetch 코드를 활성화하면 돼!
    /*
    fetch('/api/send-sms', { // 이 URL은 네 파이썬 서버의 API 엔드포인트가 될 거야.
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumber: phoneNumber,
            lottoNumbers: currentLottoNumbers.includes('눌러봐!') ? [] : currentLottoNumbers,
            pensionNumbers: currentPensionNumber.includes('눌러봐!') ? [] : currentPensionNumber
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showStatusMessage('번호 전송 성공! 🎉', false);
        } else {
            showStatusMessage(`번호 전송 실패: ${data.message} 😭`, true);
        }
    })
    .catch(error => {
        console.error('SMS 전송 오류:', error);
        showStatusMessage('SMS 전송 중 오류가 발생했어요. 다시 시도해주세요. 🥺', true);
    });
    */
});

// 💬 카카오톡으로 전송 버튼 클릭
sendKakaoBtn.addEventListener('click', () => {
    const currentLottoNumbers = Array.from(lottoNumbersDisplay.children).map(span => span.textContent);
    const currentPensionNumber = Array.from(pensionNumbersDisplay.children).map(span => span.textContent);

    // 생성된 번호가 있는지 확인
    if ((currentLottoNumbers.length === 0 || currentLottoNumbers.includes('눌러봐!')) && 
        (currentPensionNumber.length === 0 || currentPensionNumber.includes('눌러봐!'))) {
        showStatusMessage('생성된 번호가 없어요! 먼저 번호를 뽑아주세요! 🙏', true);
        return;
    }

    // 전송할 메시지 내용 구성
    let messageText = "릴리가 추천하는 행운 번호!\n\n";
    if (currentLottoNumbers.length > 0 && !currentLottoNumbers.includes('눌러봐!')) {
        messageText += `🍀 로또: ${currentLottoNumbers.join(', ')}\n`;
    }
    if (currentPensionNumber.length > 0 && !currentPensionNumber.includes('눌러봐!')) {
        messageText += `💰 연금복권: ${currentPensionNumber.join(', ')}\n`;
    }
    messageText += "\n오늘의 행운을 잡으세요! 😉";

    // Kakao.Share.sendDefault()를 사용해서 카카오톡 공유 팝업을 띄울 거야
    // 사용자가 직접 메시지를 보낼 친구를 선택하게 돼.
    if (Kakao.isInitialized()) { // 카카오 SDK가 초기화되었는지 다시 확인
        Kakao.Share.sendDefault({
            objectType: 'text', // 텍스트 메시지 타입
            text: messageText, // 전송할 메시지 내용
            link: {
                mobileWebUrl: window.location.href, // 메시지 클릭 시 이동할 모바일 웹 URL
                webUrl: window.location.href // 메시지 클릭 시 이동할 웹 URL
            }
        });
        showStatusMessage('카카오톡 공유 창이 열렸어요! 친구에게 행운을 나눠주세요! 📱');
    } else {
        showStatusMessage('카카오 SDK 초기화가 안 되어있어요. JavaScript 키를 확인해주세요! 😭', true);
    }
});


// ----------------------------------------------------
// 7. 초기 메시지 표시 (페이지 로드 시)
// ----------------------------------------------------
showStatusMessage('안녕하세요! 행운 번호를 뽑아보세요! 😊');