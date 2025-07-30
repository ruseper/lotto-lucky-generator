// script.js 파일 - 최종 버전 (여러 세트 생성 기능 추가)

// ----------------------------------------------------
// 1. DOM 요소 가져오기 (HTML 요소들을 JavaScript에서 사용하기 위해)
// ----------------------------------------------------
// 컨테이너 ID 변경됨: lottoNumbersContainer, pensionNumbersContainer
const lottoNumbersContainer = document.getElementById('lottoNumbersContainer');
const pensionNumbersContainer = document.getElementById('pensionNumbersContainer');
const generateLottoBtn = document.getElementById('generateLottoBtn');
const generatePensionBtn = document.getElementById('generatePensionBtn');
const lottoNumSetsSelect = document.getElementById('lottoNumSets'); // 로또 몇 세트? 드롭다운
const pensionNumSetsSelect = document.getElementById('pensionNumSets'); // 연금복권 몇 세트? 드롭다운
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
if (Kakao.isInitialized()) {
    console.log('카카오 SDK 초기화 성공!');
} else {
    console.error('카카오 SDK 초기화 실패! JavaScript 키를 확인해주세요.');
}

// ----------------------------------------------------
// 3. 번호 생성 함수
// ----------------------------------------------------

/**
 * 로또 번호 6개를 무작위로 생성합니다. (1~45, 중복 없음)
 * @returns {number[]} 생성된 로또 번호 배열 (오름차순 정렬)
 */
function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * 연금복권 번호를 생성합니다. (1조 ~ 5조, 6자리 숫자)
 * @returns {string} 생성된 연금복권 번호 문자열 (예: "1조123456")
 */
function generatePensionNumbers() {
    const group = Math.floor(Math.random() * 5) + 1;
    const serial = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `${group}조 ${serial}`;
}

// ----------------------------------------------------
// 4. 번호 표시 및 관리 함수 (여러 세트를 표시하기 위한 로직 추가)
// ----------------------------------------------------

/**
 * 개별 번호 세트를 HTML 요소에 표시합니다.
 * @param {HTMLElement} setElement 번호가 표시될 단일 세트 HTML 요소
 * @param {Array<number|string>} numbers 표시할 번호 배열
 * @param {number} setIndex 세트 번호 (예: 1번째 세트, 2번째 세트)
 */
function displaySingleSet(setElement, numbers, setIndex) {
    setElement.innerHTML = ''; // 기존 내용 초기화

    // 세트 번호 추가
    const setTitle = document.createElement('div');
    setTitle.className = 'set-title';
    setTitle.textContent = `${setIndex}번째 세트: `;
    setElement.appendChild(setTitle);

    if (numbers.length === 0) {
        setElement.innerHTML += '<span class="placeholder">생성 실패 🥲</span>';
        return;
    }

    // 각 번호를 span 태그로 만들어서 추가
    numbers.forEach(num => {
        const span = document.createElement('span');
        span.textContent = num;
        setElement.appendChild(span);
    });
}

/**
 * 여러 개의 번호 세트들을 컨테이너에 표시합니다.
 * @param {HTMLElement} containerElement 모든 세트가 담길 부모 HTML 요소
 * @param {Array<Array<number|string>>} allSets 모든 번호 세트 배열 (예: [[로또1],[로또2]])
 * @param {'lotto'|'pension'} type 로또인지 연금복권인지 타입 구분
 */
function displayMultipleSets(containerElement, allSets, type) {
    containerElement.innerHTML = ''; // 컨테이너 초기화 (기존 플레이스홀더 및 모든 세트 삭제)

    if (allSets.length === 0) {
        // 생성된 세트가 없으면 플레이스홀더를 다시 표시
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'number-set-item numbers-display';
        placeholderDiv.innerHTML = '<span class="placeholder">눌러봐!</span>';
        containerElement.appendChild(placeholderDiv);
        return;
    }

    allSets.forEach((numbers, index) => {
        const setDiv = document.createElement('div');
        setDiv.className = 'number-set-item numbers-display'; // CSS 적용을 위해 클래스 추가
        displaySingleSet(setDiv, numbers, index + 1); // 1번째 세트부터 시작
        containerElement.appendChild(setDiv);
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
    const numSets = parseInt(lottoNumSetsSelect.value); // 드롭다운에서 선택된 세트 개수 가져오기
    const allLottoSets = [];

    for (let i = 0; i < numSets; i++) {
        allLottoSets.push(generateLottoNumbers());
    }
    displayMultipleSets(lottoNumbersContainer, allLottoSets, 'lotto');
    showStatusMessage(`로또 번호 ${numSets}세트가 생성되었어요! 행운을 빌어요! 😄`);
});

// 💰 연금복권 번호 생성 버튼 클릭
generatePensionBtn.addEventListener('click', () => {
    const numSets = parseInt(pensionNumSetsSelect.value); // 드롭다운에서 선택된 세트 개수 가져오기
    const allPensionSets = [];

    for (let i = 0; i < numSets; i++) {
        allPensionSets.push([generatePensionNumbers()]); // 연금복권은 문자열이므로 배열로 감싸서 저장
    }
    displayMultipleSets(pensionNumbersContainer, allPensionSets, 'pension');
    showStatusMessage(`연금복권 번호 ${numSets}세트가 생성되었어요! 부자되세요~! 💰`);
});

// 📱 SMS로 전송 버튼 클릭
sendSmsBtn.addEventListener('click', () => {
    const phoneNumber = phoneNumberInput.value.trim();
    
    // 현재 표시된 모든 로또 번호 세트 가져오기
    const allLottoSets = Array.from(lottoNumbersContainer.querySelectorAll('.number-set-item')).map(setItem => {
        const numbers = Array.from(setItem.querySelectorAll('span:not(.placeholder)'));
        return numbers.map(span => span.textContent);
    }).filter(set => set.length > 0); // 플레이스홀더 제외

    // 현재 표시된 모든 연금복권 번호 세트 가져오기
    const allPensionSets = Array.from(pensionNumbersContainer.querySelectorAll('.number-set-item')).map(setItem => {
        const numbers = Array.from(setItem.querySelectorAll('span:not(.placeholder)'));
        return numbers.map(span => span.textContent);
    }).filter(set => set.length > 0); // 플레이스홀더 제외

    // 유효성 검사 (번호가 생성되지 않았으면 전송 불가)
    if (allLottoSets.length === 0 && allPensionSets.length === 0) {
        showStatusMessage('생성된 번호가 없어요! 먼저 번호를 뽑아주세요! 🙏', true);
        return;
    }

    // 휴대폰 번호 유효성 검사
    if (!phoneNumber) {
        showStatusMessage('휴대폰 번호를 입력해주세요! 🚨', true);
        return;
    }
    if (phoneNumber.length < 10 || phoneNumber.length > 11 || !/^\d+$/.test(phoneNumber)) {
        showStatusMessage('유효한 휴대폰 번호를 입력해주세요! (숫자 10-11자리) 🚫', true);
        return;
    }

    showStatusMessage(`${phoneNumber} (으)로 번호를 전송 중... (실제 발송은 백엔드 연동 후 가능)`);

    console.log("SMS 전송 시뮬레이션 데이터:");
    console.log("받는 사람:", phoneNumber);
    console.log("로또 번호 세트:", allLottoSets);
    console.log("연금복권 번호 세트:", allPensionSets);

    // 나중에 백엔드 연동 시 아래 fetch 코드를 활성화하면 돼!
    /*
    fetch('/api/send-sms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumber: phoneNumber,
            lottoSets: allLottoSets,
            pensionSets: allPensionSets
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
    // 현재 표시된 모든 로또 번호 세트 가져오기
    const allLottoSets = Array.from(lottoNumbersContainer.querySelectorAll('.number-set-item')).map(setItem => {
        const numbers = Array.from(setItem.querySelectorAll('span:not(.placeholder)'));
        return numbers.map(span => span.textContent);
    }).filter(set => set.length > 0);

    // 현재 표시된 모든 연금복권 번호 세트 가져오기
    const allPensionSets = Array.from(pensionNumbersContainer.querySelectorAll('.number-set-item')).map(setItem => {
        const numbers = Array.from(setItem.querySelectorAll('span:not(.placeholder)'));
        return numbers.map(span => span.textContent);
    }).filter(set => set.length > 0);

    // 생성된 번호가 없으면 전송 불가
    if (allLottoSets.length === 0 && allPensionSets.length === 0) {
        showStatusMessage('생성된 번호가 없어요! 먼저 번호를 뽑아주세요! 🙏', true);
        return;
    }

    // 전송할 메시지 내용 구성
    let messageText = "💖 다은이와 다솜이가 추천하는 행운 번호! 💖\n";

    if (allLottoSets.length > 0) {
        messageText += `\n🍀 로또 번호 (${allLottoSets.length}세트):\n`;
        allLottoSets.forEach((set, index) => {
            messageText += `  ${index + 1}세트: ${set.join(', ')}\n`;
        });
    }

    if (allPensionSets.length > 0) {
        messageText += `\n💰 연금복권 번호 (${allPensionSets.length}세트):\n`;
        allPensionSets.forEach((set, index) => {
            messageText += `  ${index + 1}세트: ${set.join(', ')}\n`;
        });
    }
    
    messageText += "\n오늘의 행운을 잡으세요! 😉";

    // Kakao.Share.sendDefault()를 사용해서 카카오톡 공유 팝업을 띄울 거야
    if (Kakao.isInitialized()) {
        Kakao.Share.sendDefault({
            objectType: 'text',
            text: messageText,
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href
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