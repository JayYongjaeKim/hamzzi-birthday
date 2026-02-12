/* =========================
   Firebase (Firestore) 연결 (모듈 방식)
   - CDN import 사용
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// ✅ Firebase 콘솔 Web App 설정값 그대로 넣기
const firebaseConfig = {
  apiKey: "AIzaSyAgCAi09y4MBUr0XlpzMw0XF3X_gx1aBvg",
  authDomain: "birthday-8d372.firebaseapp.com",
  projectId: "birthday-8d372",
  storageBucket: "birthday-8d372.firebasestorage.app",
  messagingSenderId: "624348070080",
  appId: "1:624348070080:web:d758b903704e370fd72d25"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// (디버깅용) 콘솔에서 window.db 찍으면 Firestore 객체 보여야 함
window.db = db;

/* =========================
   공용: 모달 + 폭죽
========================= */
const modal = document.getElementById("modal");
const btnCloseModal = document.getElementById("btnCloseModal");
const confettiBox = document.getElementById("confetti");

function openModal(title, text) {
  const t = document.getElementById("modalTitle");
  const p = document.getElementById("modalText");
  if (t) t.textContent = title || "";
  if (p) p.textContent = text || "";
  modal?.classList.add("show");
}
function closeModal() {
  modal?.classList.remove("show");
}
btnCloseModal?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function popConfetti(count = 100) {
  if (!confettiBox) return;
  const colors = ["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#ffbe0b"];
  const w = window.innerWidth;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = (Math.random() * w) + "px";
    el.style.top = "-20px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.1 + Math.random() * 1.2) + "s";
    confettiBox.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

/* =========================
   페이지 전환
========================= */
const gate = document.getElementById("gate");
const pageMain = document.getElementById("pageMain") || document.getElementById("main");
const pageGames = document.getElementById("pageGames");
const pageMessage = document.getElementById("pageMessage");

function showOnly(target) {
  [pageMain, pageGames, pageMessage].forEach((p) => p?.classList.add("hidden"));
  target?.classList.remove("hidden");
  window.scrollTo(0, 0);
}

/* =========================
   Gate: Yes/No 트릭
========================= */
const gateArea = document.getElementById("gateArea");
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const gateHint = document.getElementById("gateHint");

let chaseMode = false;

function placeButtons() {
  if (!gateArea || !btnYes || !btnNo) return;
  const rect = gateArea.getBoundingClientRect();
  btnYes.style.left = "60px";
  btnYes.style.top = "80px";
  btnNo.style.left = rect.width - 200 + "px";
  btnNo.style.top = "80px";
}
window.addEventListener("load", placeButtons);
window.addEventListener("resize", placeButtons);

function moveNoRandom() {
  if (!gateArea || !btnNo) return;
  const rect = gateArea.getBoundingClientRect();
  const pad = 12;
  const maxX = rect.width - btnNo.offsetWidth - pad;
  const maxY = rect.height - btnNo.offsetHeight - pad;
  const x = pad + Math.random() * maxX;
  const y = pad + Math.random() * maxY;
  btnNo.style.left = x + "px";
  btnNo.style.top = y + "px";
}

btnNo?.addEventListener("mouseenter", () => {
  chaseMode = true;
  if (gateHint) gateHint.textContent = "No는 안돼요!!";
  moveNoRandom();
});

gateArea?.addEventListener("mousemove", (e) => {
  if (!chaseMode || !gateArea || !btnYes) return;
  const rect = gateArea.getBoundingClientRect();
  let nx = e.clientX - rect.left + 20;
  let ny = e.clientY - rect.top + 20;
  nx = Math.max(0, Math.min(nx, rect.width - btnYes.offsetWidth));
  ny = Math.max(0, Math.min(ny, rect.height - btnYes.offsetHeight));
  btnYes.style.left = nx + "px";
  btnYes.style.top = ny + "px";
});

btnNo?.addEventListener("click", (e) => {
  e.preventDefault();
  chaseMode = true;
  if (gateHint) gateHint.textContent = "No는 불가해요... Yes만 가능 😇";
  moveNoRandom();
});

btnYes?.addEventListener("click", () => {
  popConfetti(160);
  openModal("🎂 정답!", "햄찌윤서 생일 축하해! 메인 페이지로 이동!");
  setTimeout(() => {
    closeModal();
    gate?.classList.add("hidden");
    showOnly(pageMain);
  }, 800);
});

/* =========================
   메인 버튼
========================= */
document.getElementById("btnConfetti")?.addEventListener("click", () => popConfetti(140));
document.getElementById("btnGoGames")?.addEventListener("click", () => showOnly(pageGames));

/* =========================
   닉네임/게임 상태
========================= */
let currentNick = "";
let gameStartedAt = null;
let gameFinishedAt = null;

function setNickUI() {
  const el = document.getElementById("currentNick");
  if (el) el.textContent = currentNick || "-";
}

/* =========================
   점수/등수 시스템 (5점 만점)
========================= */
let score = 0;
const solved = { diff: false, q2: false, q3: false, q4: false, q5: false };

function updateScoreUI() {
  const scoreText = document.getElementById("scoreText");
  const rankText = document.getElementById("rankText");
  if (scoreText) scoreText.textContent = String(score);

  if (!rankText) return;

  if (score <= 1) rankText.textContent = "현재 예상 등수: 5등 (좀 더 윤서를 알아가자!)";
  else if (score === 2) rankText.textContent = "현재 예상 등수: 4등 (오~ 조금 아는 편!)";
  else if (score === 3) rankText.textContent = "현재 예상 등수: 3등 (윤잘알 중간급!)";
  else if (score === 4) rankText.textContent = "현재 예상 등수: 2등 (거의 윤서 전문가!)";
  else rankText.textContent = "현재 예상 등수: 1등 (윤박사 👑)";
}

function addPoint(key) {
  if (solved[key]) return;
  solved[key] = true;
  score += 1;
  updateScoreUI();
  maybeFinishAndRecord();
}

/* =========================
   Firestore: 랭킹 저장/표시
   - 컬렉션 이름: rank
========================= */
function msToText(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  if (m <= 0) return `${ss}초`;
  return `${m}분 ${ss}초`;
}

let unsubscribeRank = null;

function listenLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  try {
    if (unsubscribeRank) unsubscribeRank();

    // 랭킹: 최근 기록을 많이 가져와서 프론트에서 정렬 후 TOP5 표시
    const qRank = query(collection(db, "rank"), orderBy("finishedAt", "desc"), limit(200));

    unsubscribeRank = onSnapshot(
      qRank,
      (snap) => {
        const rows = [];
        snap.forEach((doc) => {
          const d = doc.data();
          // dummy 제거
          if (d?.dummy) return;
          if (!d?.nick) return;
          rows.push({
            nick: d.nick,
            score: d.score ?? 0,
            elapsedMs: d.elapsedMs ?? 999999999,
            finishedAtMs: d.finishedAt?.toMillis ? d.finishedAt.toMillis() : Number(d.finishedAtMs ?? 0),
          });
        });

        // 정렬: 점수 내림차순, 동점이면 소요시간 오름차순, 동점이면 완료시각 오름차순
        rows.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
          return a.finishedAtMs - b.finishedAtMs;
        });

        const top5 = rows.slice(0, 5);

        list.innerHTML = "";
        if (top5.length === 0) {
          const li = document.createElement("li");
          li.textContent = "아직 기록이 없어요! 1등은 윤서가 가져간다 😆";
          list.appendChild(li);
          return;
        }

        top5.forEach((r, idx) => {
          const li = document.createElement("li");
          li.textContent = `${idx + 1}위 - ${r.nick} / ${r.score}점 / ${msToText(r.elapsedMs)}`;
          list.appendChild(li);
        });
      },
      (err) => {
        console.error(err);
        list.innerHTML = "";
        const li = document.createElement("li");
        li.textContent = "랭킹을 불러오지 못했어요. Firestore 규칙/설정을 확인해줘!";
        list.appendChild(li);
      }
    );
  } catch (e) {
    console.error(e);
  }
}

// 올클리어 시 Firestore에 기록 저장
async function maybeFinishAndRecord() {
  if (score !== 5) return;
  if (!currentNick || !gameStartedAt) return;
  if (gameFinishedAt) return;

  gameFinishedAt = Date.now();
  const elapsedMs = gameFinishedAt - gameStartedAt;

  try {
    await addDoc(collection(db, "rank"), {
      nick: currentNick,
      score: 5,
      elapsedMs,
      finishedAt: serverTimestamp(),
      finishedAtMs: gameFinishedAt, // 정렬 보조용
    });

    popConfetti(220);
    openModal("🏆 올클리어!", `윤잘알 테스트 완료!\n${currentNick} 기록이 랭킹에 저장됐어요!`);
  } catch (e) {
    console.error(e);
    openModal("저장 실패", "랭킹 저장을 못했어요. Firestore 규칙/설정을 확인해줘!");
  }
}

/* =========================
   닉네임 시작
========================= */
document.getElementById("btnStartGames")?.addEventListener("click", () => {
  const input = document.getElementById("nicknameInput");
  const status = document.getElementById("nickStatus");
  const nick = (input?.value || "").trim();

  if (!nick) {
    if (status) status.textContent = "닉네임을 입력해야 시작할 수 있어요!";
    openModal("닉네임 필요!", "닉네임을 입력하고 시작 버튼을 눌러주세요!");
    return;
  }

  currentNick = nick;
  gameStartedAt = Date.now();
  gameFinishedAt = null;

  // 새 게임 시작하면 점수/상태 초기화
  score = 0;
  Object.keys(solved).forEach((k) => (solved[k] = false));
  updateScoreUI();

  if (status) status.textContent = `닉네임 확정: ${currentNick} ✅ 이제 게임을 진행해주세요!`;
  setNickUI();
});

/* =========================
   네비게이션 버튼
========================= */
document.getElementById("btnBackToMain")?.addEventListener("click", () => showOnly(pageMain));

document.getElementById("btnGoMessage")?.addEventListener("click", () => {
  showOnly(pageMessage);
  setNickUI();
  renderMessages(); // 화면 갱신
});

document.getElementById("btnBackToGames")?.addEventListener("click", () => showOnly(pageGames));
document.getElementById("btnBackToMain2")?.addEventListener("click", () => showOnly(pageMain));

/* =========================
   게임 1: 틀린그림찾기(4개) - 넓은 영역(사각형) 클릭으로 정답 처리
   조건:
   - 오른쪽 캔버스(cvRight)만 클릭해도 정답 인정
   - 각 차이마다 클릭 가능한 "사각형 영역"을 넓게 잡음
========================= */

(() => {
  const cvLeft = document.getElementById("cvLeft");
  const cvRight = document.getElementById("cvRight");
  const foundCountEl = document.getElementById("foundCount");
  if (!cvLeft || !cvRight || !foundCountEl) return;

  const ctxL = cvLeft.getContext("2d");
  const ctxR = cvRight.getContext("2d");

  const imgLeft = new Image();
  const imgRight = new Image();

  // ✅ 네 이미지 경로 그대로
  imgLeft.src = "images/ham2.jpeg";   // 왼쪽(원본)
  imgRight.src = "images/ham11.jpeg"; // 오른쪽(수정본)

  // ====== 1) 기본: 이미지 그리기 ======
  function drawAll() {
    if (!imgLeft.complete || !imgRight.complete) return;
    ctxL.clearRect(0, 0, cvLeft.width, cvLeft.height);
    ctxR.clearRect(0, 0, cvRight.width, cvRight.height);

    ctxL.drawImage(imgLeft, 0, 0, cvLeft.width, cvLeft.height);
    ctxR.drawImage(imgRight, 0, 0, cvRight.width, cvRight.height);

    // ✅ 표시(동그라미/사각형) 없이 "그냥 카운트만" 할 거면 아래 주석 유지
    // 만약 찾았을 때 표시하고 싶으면 아래 drawMark를 사용하면 됨.
    // foundBoxes.forEach(b => drawMark(ctxL, b), drawMark(ctxR, b));
  }

  // ====== 2) 클릭 좌표를 0~1 비율로 변환 ======
  function getNormPos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0~1
    const y = (e.clientY - rect.top) / rect.height;   // 0~1
    return { x, y };
  }

  // ====== 3) 넓은 "정답 영역" 사각형(비율 기준) ======
  // NOTE: x,y,w,h 는 "오른쪽 캔버스" 기준 0~1 비율 좌표
  // 지금은 2x2 사진 그리드라고 가정하고 "대충 넓게" 잡아둠.
  // 화면에서 조금 어긋나면 숫자만 살짝 조절하면 됨.
  const DIFF_AREAS = [
    // 1) 위-왼쪽(꽃색 다름) -> 오른쪽 이미지의 "위-왼쪽 사진 전체" 아무 곳
    { id: 1, x: 0.02, y: 0.02, w: 0.48, h: 0.48 },

    // 2) 위-오른쪽(햄스터라 완전 다름) -> 오른쪽 이미지의 "위-오른쪽 사진 전체" 아무 곳
    { id: 2, x: 0.50, y: 0.02, w: 0.48, h: 0.48 },

    // 3) 아래-왼쪽(목걸이 없음) -> 오른쪽 이미지에서 "아래-왼쪽 사진의 목 주변" 넓게
    // 아래-왼쪽 사진 영역 안에서도 "목/가슴 중앙" 근처만 넓게 잡음
    { id: 3, x: 0.12, y: 0.63, w: 0.30, h: 0.22 },

    // 4) 아래-오른쪽(꽃 봉우리 사라짐) -> 오른쪽 이미지에서 "아래-오른쪽 꽃 부분" 넓게
    { id: 4, x: 0.72, y: 0.45, w: 0.26, h: 0.50 },
  ];

  function hitRect(p, r) {
    return (
      p.x >= r.x &&
      p.x <= (r.x + r.w) &&
      p.y >= r.y &&
      p.y <= (r.y + r.h)
    );
  }

  // ====== 4) 찾은 것 관리 ======
  const found = new Set();

  function setFound(id) {
    if (found.has(id)) return;
    found.add(id);
    foundCountEl.textContent = String(found.size);

    // ✅ 표시 없이 카운트만 올림
    // drawAll();  // 필요하면 다시그리기

    if (found.size === DIFF_AREAS.length) {
      // 네 코드에 openModal / popConfetti / addPoint 있다면 이걸로 처리
      if (typeof popConfetti === "function") popConfetti(200);
      if (typeof openModal === "function") openModal("🎉 완료!", "틀린그림찾기 성공! +1점");
      if (typeof addPoint === "function") addPoint("diff");
    }
  }

  // ====== 5) 클릭 처리: 오른쪽 캔버스 아무 곳 클릭 -> 해당 영역이면 정답 ======
  function handleRightClick(e) {
    const p = getNormPos(cvRight, e);

    // 이미 다 찾았으면 무시
    if (found.size >= DIFF_AREAS.length) return;

    // 아직 안 찾은 영역 중 하나라도 맞으면 정답
    for (const area of DIFF_AREAS) {
      if (found.has(area.id)) continue;
      if (hitRect(p, area)) {
        setFound(area.id);
        return;
      }
    }

    // 영역 밖 클릭은 아무 반응 없게(원하면 모달 띄워도 됨)
    // if (typeof openModal === "function") openModal("앗!", "다른 곳을 눌러봐요!");
  }

  // ✅ 오른쪽만 클릭 인정
  cvRight.addEventListener("click", handleRightClick);

  // ====== 6) 로드/리사이즈 ======
  imgLeft.onload = drawAll;
  imgRight.onload = drawAll;
  window.addEventListener("resize", drawAll);
})();

/* =========================
   게임 2~5: 4지선다 퀴즈
========================= */
const QUIZZES = {
  q2: { elOpt: "opt2", elHint: "hint2", options: ["경영학", "컴퓨터공학", "심리학", "사회복지학"], answerIndex: 3 },
  q3: { elOpt: "opt3", elHint: "hint3", options: ["2월 16일", "3월 1일", "12월 25일", "1월 1일"], answerIndex: 0 },
  q4: { elOpt: "opt4", elHint: "hint4", options: ["마라탕", "해산물", "떡볶이", "국밥"], answerIndex: 1 },
  q5: { elOpt: "opt5", elHint: "hint5", options: ["고양이", "강아지", "햄스터", "토끼"], answerIndex: 2 },
};

function renderQuiz(key) {
  const conf = QUIZZES[key];
  const box = document.getElementById(conf.elOpt);
  const hint = document.getElementById(conf.elHint);
  if (!box || !hint) return;

  hint.textContent = "";
  box.innerHTML = "";

  conf.options.forEach((txt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt";
    btn.textContent = txt;

    btn.addEventListener("click", () => {
      if (!currentNick || !gameStartedAt) {
        openModal("닉네임 먼저!", "위에서 닉네임 입력하고 시작 버튼을 눌러주세요!");
        return;
      }

      if (solved[key]) {
        popConfetti(30);
        openModal("이미 완료!", "이 문제는 이미 점수 반영됐어요 😆");
        return;
      }

      if (idx === conf.answerIndex) {
        popConfetti(180);
        openModal("✅ 정답!", "+1점 획득!");
        hint.textContent = "정답! ✅";
        addPoint(key);
      } else {
        openModal("❌ 땡!", "다시 생각해보세요 😆");
        hint.textContent = "오답! ❌";
      }
    });

    box.appendChild(btn);
  });
}

/* =========================
   Firestore: 메시지 저장/불러오기
   - 컬렉션 이름: messages
========================= */
let unsubscribeMsgs = null;

function renderMessagesUI(rows) {
  const ul = document.getElementById("msgList");
  if (!ul) return;

  ul.innerHTML = "";
  if (!rows || rows.length === 0) return;

  rows.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.nick}: ${m.text}`;
    ul.appendChild(li);
  });
}

function renderMessages() {
  // 실시간 구독 1회만
  try {
    if (unsubscribeMsgs) return;

    const qMsgs = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(200));

    unsubscribeMsgs = onSnapshot(
      qMsgs,
      (snap) => {
        const rows = [];
        snap.forEach((doc) => {
          const d = doc.data();
          if (d?.dummy) return;
          if (!d?.nick || !d?.text) return;
          rows.push({ nick: d.nick, text: d.text });
        });
        renderMessagesUI(rows);
      },
      (err) => {
        console.error(err);
        openModal("에러", "메시지를 불러오지 못했어요. Firestore 설정(규칙/DB) 확인해줘!");
      }
    );
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("btnAddMsg")?.addEventListener("click", async () => {
  if (!currentNick) {
    openModal("닉네임 먼저!", "게임 페이지에서 닉네임을 먼저 확정해주세요!");
    return;
  }

  const input = document.getElementById("msgInput");
  const text = (input?.value || "").trim();
  if (!text) return;

  try {
    await addDoc(collection(db, "messages"), {
      nick: currentNick,
      text,
      createdAt: serverTimestamp(),
    });

    input.value = "";
    popConfetti(80);
  } catch (e) {
    console.error(e);
    openModal("저장 실패", "메시지 저장을 못했어요. Firestore 규칙/설정을 확인해줘!");
  }
});

/* =========================
   초기 렌더
========================= */
["q2", "q3", "q4", "q5"].forEach(renderQuiz);
updateScoreUI();
listenLeaderboard();
renderMessages();
setNickUI();
