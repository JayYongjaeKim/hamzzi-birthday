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
   localStorage (랭킹/메시지)
========================= */
const LS_RANK = "yunseo_rank_v1";
const LS_MSG  = "yunseo_msgs_v1";

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return (v ?? fallback);
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   페이지 전환
========================= */
const gate = document.getElementById("gate");
const pageMain = document.getElementById("pageMain") || document.getElementById("main");
const pageGames = document.getElementById("pageGames");
const pageMessage = document.getElementById("pageMessage");

function showOnly(target) {
  [pageMain, pageGames, pageMessage].forEach(p => p?.classList.add("hidden"));
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
  btnNo.style.left = (rect.width - 200) + "px";
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
  let nx = (e.clientX - rect.left) + 20;
  let ny = (e.clientY - rect.top) + 20;
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

  if (status) status.textContent = `닉네임 확정: ${currentNick} ✅ 이제 게임을 진행해주세요!`;
  setNickUI();
  renderLeaderboard();
});

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

function maybeFinishAndRecord() {
  if (score !== 5) return;
  if (!currentNick || !gameStartedAt) return;

  // 이미 기록했으면 중복 저장 방지
  if (gameFinishedAt) return;

  gameFinishedAt = Date.now();
  const elapsedMs = gameFinishedAt - gameStartedAt;

  const rankData = loadJSON(LS_RANK, []);
  rankData.push({
    nick: currentNick,
    score: 5,
    elapsedMs,
    finishedAt: gameFinishedAt,
  });

  // 정렬: 점수 내림차순, 동점이면 완료시간 빠른 순(먼저 끝난 사람이 위)
  rankData.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.finishedAt - b.finishedAt;
  });

  saveJSON(LS_RANK, rankData);

  popConfetti(220);
  openModal("🏆 올클리어!", `윤잘알 테스트 완료!\n${currentNick} 기록이 랭킹에 저장됐어요!`);
  renderLeaderboard();
}

function addPoint(key) {
  if (solved[key]) return;
  solved[key] = true;
  score += 1;
  updateScoreUI();
  maybeFinishAndRecord();
}

/* =========================
   랭킹 TOP5 표시
========================= */
function msToText(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  if (m <= 0) return `${ss}초`;
  return `${m}분 ${ss}초`;
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  const rankData = loadJSON(LS_RANK, []);
  const top5 = rankData.slice(0, 5);

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
}

/* =========================
   네비게이션 버튼
========================= */
document.getElementById("btnBackToMain")?.addEventListener("click", () => showOnly(pageMain));

document.getElementById("btnGoMessage")?.addEventListener("click", () => {
  showOnly(pageMessage);
  setNickUI();
  renderMessages();
});

document.getElementById("btnBackToGames")?.addEventListener("click", () => showOnly(pageGames));
document.getElementById("btnBackToMain2")?.addEventListener("click", () => showOnly(pageMain));

/* =========================
   게임 1: 틀린그림찾기(5개)
========================= */
const cvLeft = document.getElementById("cvLeft");
const cvRight = document.getElementById("cvRight");

if (cvLeft && cvRight) {
  const ctxL = cvLeft.getContext("2d");
  const ctxR = cvRight.getContext("2d");
  const foundCountEl = document.getElementById("foundCount");

  const imgLeft = new Image();
  const imgRight = new Image();
  imgLeft.src = "images/ham2.jpg";
  imgRight.src = "images/ham11.jpg";

  const DIFF_POINTS = [
    { x: 0.22, y: 0.28, r: 0.05 },
    { x: 0.68, y: 0.22, r: 0.05 },
    { x: 0.78, y: 0.52, r: 0.05 },
    { x: 0.30, y: 0.72, r: 0.05 },
    { x: 0.58, y: 0.80, r: 0.05 },
  ];

  let found = new Array(DIFF_POINTS.length).fill(false);

  function drawCircle(ctx, p) {
    const cx = p.x * cvLeft.width;
    const cy = p.y * cvLeft.height;
    const rr = p.r * cvLeft.width;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 60, 110, 0.95)";
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 60, 110, 0.15)";
    ctx.fill();
    ctx.restore();
  }

  function drawAll() {
    if (!imgLeft.complete || !imgRight.complete) return;
    ctxL.clearRect(0, 0, cvLeft.width, cvLeft.height);
    ctxR.clearRect(0, 0, cvRight.width, cvRight.height);
    ctxL.drawImage(imgLeft, 0, 0, cvLeft.width, cvLeft.height);
    ctxR.drawImage(imgRight, 0, 0, cvRight.width, cvRight.height);

    for (let i = 0; i < DIFF_POINTS.length; i++) {
      if (!found[i]) continue;
      drawCircle(ctxL, DIFF_POINTS[i]);
      drawCircle(ctxR, DIFF_POINTS[i]);
    }
  }

  function handleClick(e) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    let hit = -1;
    for (let i = 0; i < DIFF_POINTS.length; i++) {
      if (found[i]) continue;
      const p = DIFF_POINTS[i];
      const dx = px - p.x;
      const dy = py - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= p.r) { hit = i; break; }
    }

    if (hit === -1) {
      openModal("앗!", "다른 곳을 찾아봐요 🔎");
      return;
    }

    found[hit] = true;
    const cnt = found.filter(Boolean).length;
    if (foundCountEl) foundCountEl.textContent = String(cnt);
    drawAll();

    if (cnt === 5) {
      popConfetti(200);
      openModal("🎉 완료!", "틀린그림찾기 성공! +1점");
      addPoint("diff");
    }
  }

  cvLeft.addEventListener("click", handleClick);
  cvRight.addEventListener("click", handleClick);
  imgLeft.onload = drawAll;
  imgRight.onload = drawAll;
}

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
      // 닉네임 시작 안 했으면 막기
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
   메시지 페이지(닉네임 + 메시지 리스트)
========================= */
function renderMessages() {
  const ul = document.getElementById("msgList");
  if (!ul) return;

  const data = loadJSON(LS_MSG, []);
  ul.innerHTML = "";

  data.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.nick}: ${m.text}`;
    ul.appendChild(li);
  });
}

document.getElementById("btnAddMsg")?.addEventListener("click", () => {
  if (!currentNick) {
    openModal("닉네임 먼저!", "게임 페이지에서 닉네임을 먼저 확정해주세요!");
    return;
  }

  const input = document.getElementById("msgInput");
  const text = (input?.value || "").trim();
  if (!text) return;

  const data = loadJSON(LS_MSG, []);
  data.unshift({ nick: currentNick, text, ts: Date.now() });
  saveJSON(LS_MSG, data);

  input.value = "";
  renderMessages();
  popConfetti(80);
});

/* =========================
   초기 렌더
========================= */
["q2", "q3", "q4", "q5"].forEach(renderQuiz);
updateScoreUI();
renderLeaderboard();
renderMessages();
setNickUI();



/* =========================
   Game 1) 틀린그림찾기
   - cvLeft / cvRight 캔버스에 이미지 그리기
   - 특정 좌표(원) 안을 클릭하면 정답 처리 + 동그라미 표시
========================= */

(() => {
  const cvLeft = document.getElementById("cvLeft");
  const cvRight = document.getElementById("cvRight");
  const foundCountEl = document.getElementById("foundCount");

  if (!cvLeft || !cvRight || !foundCountEl) return;

  const ctxL = cvLeft.getContext("2d");
  const ctxR = cvRight.getContext("2d");

  // ✅ 너가 정한 "정답 영역(원)" 좌표
  // (주의) 이 값은 '캔버스 크기(520x520)' 기준 좌표야.
  // 이미지가 다르면 좌표는 바꿔줘야 함.
  const DIFFS = [
    { id: 1, x: 240, y: 180, r: 60 }, // 위-왼쪽: 꽃잎 파란색
    { id: 2, x: 390, y: 165, r: 95 }, // 위-오른쪽: 얼굴 햄스터
    { id: 3, x: 260, y: 600, r: 40 }, // 아래-왼쪽: 목걸이 제거 (※ 캔버스 520이면 y가 넘어감 -> 아래 설명 참고)
    { id: 4, x: 480, y: 585, r: 40 }, // 아래-오른쪽: 꽃 제거 (※ 캔버스 520이면 y가 넘어감 -> 아래 설명 참고)
    { id: 5, x: 248, y: 565, r: 45 }, // 아래-왼쪽: 꽃잎 증가 (※ 캔버스 520이면 y가 넘어감 -> 아래 설명 참고)
  ];

  // ✅ 찾은 것 저장
  const found = new Set();

  // ✅ 이미지 로드
  const leftImg = new Image();
  const rightImg = new Image();

  leftImg.src = "images/ham2.jpg";
  rightImg.src = "images/ham11.jpg";

  // ✅ 이미지가 캔버스에 들어갈 때 "어떻게 그릴지"
  // cover처럼 꽉 채우되, 좌표 계산이 정확하게 되도록 동일한 방식으로 그려야 함
  function drawCover(ctx, img, cw, ch) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  function redraw() {
    if (leftImg.complete && rightImg.complete) {
      drawCover(ctxL, leftImg, cvLeft.width, cvLeft.height);
      drawCover(ctxR, rightImg, cvRight.width, cvRight.height);

      // 이미 찾은 정답들 동그라미 다시 그리기
      for (const diff of DIFFS) {
        if (found.has(diff.id)) {
          drawCircle(ctxL, diff);
          drawCircle(ctxR, diff);
        }
      }
    }
  }

  function drawCircle(ctx, diff) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,0,0,0.85)";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  // ✅ 클릭한 좌표를 "캔버스 좌표"로 바꾸는 함수
  function getCanvasXY(canvas, event) {
    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    return { x, y };
  }

  function handleClick(canvas, ctx, e) {
    const { x, y } = getCanvasXY(canvas, e);

    for (const diff of DIFFS) {
      if (found.has(diff.id)) continue;

      const dx = x - diff.x;
      const dy = y - diff.y;

      // 원 안인지 판별: dx^2 + dy^2 <= r^2
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        found.add(diff.id);

        // 양쪽 캔버스에 동그라미
        drawCircle(ctxL, diff);
        drawCircle(ctxR, diff);

        foundCountEl.textContent = String(found.size);

        // 5개 다 찾으면 완료 처리(원하면 여기서 점수 추가/다음 게임 열기 등)
        if (found.size === 5) {
          alert("🎉 다 찾았어요! 게임 1 완료!");
        }
        return;
      }
    }
  }

  // ✅ 이벤트 연결 (왼쪽/오른쪽 아무거나 눌러도 인정)
  cvLeft.addEventListener("click", (e) => handleClick(cvLeft, ctxL, e));
  cvRight.addEventListener("click", (e) => handleClick(cvRight, ctxR, e));

  // ✅ 이미지 로드 완료되면 그림
  leftImg.onload = redraw;
  rightImg.onload = redraw;

  // ✅ 화면 리사이즈 되어도 캔버스 다시 그리기(동그라미 유지)
  window.addEventListener("resize", redraw);
})();

