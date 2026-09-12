// ===================================================
// 우리 반 담벼락 - Firebase Firestore 연동
//
// 이제 메모 데이터가 브라우저 배열이 아니라
// Firebase Firestore 클라우드 데이터베이스에 저장됩니다.
// 새로고침해도 메모가 유지됩니다.
// ===================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyA8TGka5-X69y8R_tBhrgfN7XLNGLjtw50",
  authDomain: "class-76bff.firebaseapp.com",
  projectId: "class-76bff",
  storageBucket: "class-76bff.firebasestorage.app",
  messagingSenderId: "90807585118",
  appId: "1:90807585118:web:6fc88a5d04ab72633be7cf"
};

// Firebase 초기화 및 Firestore 연결
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===================================================
// 데이터를 다루는 함수 세 개
// Firestore를 사용하여 메모를 읽고, 쓰고, 지웁니다.
// ===================================================

// 메모를 읽어 옵니다.
// Firestore의 'memos' 컬렉션에서 작성 시각(createdAt) 순서대로 가져옵니다.
async function loadMemos() {
  try {
    const q = query(collection(db, "memos"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const memoList = [];
    querySnapshot.forEach(function (docSnap) {
      memoList.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return memoList;
  } catch (error) {
    console.error("메모를 불러오는 중 오류가 발생했습니다:", error);
    return [];
  }
}

// 메모를 새로 씁니다.
// 5글자 이상, 50글자 미만일 때만 Firestore에 저장합니다.
// 백엔드 2: 여기에 "누가 썼는지"(uid)를 함께 저장하게 됩니다.
async function addMemo(text) {
  if (text.length < 5 || text.length >= 50) {
    alert("메모는 5글자 이상, 50글자 미만으로 입력해 주세요.");
    return false;
  }

  try {
    await addDoc(collection(db, "memos"), {
      text: text,
      createdAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error("메모를 저장하는 중 오류가 발생했습니다:", error);
    alert("메모 저장 실패: Firestore 규칙에 맞지 않거나 오류가 발생했습니다.");
    return false;
  }
}

// 메모를 지웁니다.
// 백엔드 2: 지금은 누구든 남의 메모를 지울 수 있습니다. 이걸 막는 것이 과제입니다.
async function deleteMemo(id) {
  try {
    await deleteDoc(doc(db, "memos", id));
  } catch (error) {
    console.error("메모를 삭제하는 중 오류가 발생했습니다:", error);
  }
}


// ===================================================
// 화면 그리기
// ===================================================

async function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  const memoList = await loadMemos();
  memoList.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  const del = document.createElement("button");
  del.textContent = "×";
  del.addEventListener("click", async function () {
    await deleteMemo(memo.id);
    await render();
  });
  div.appendChild(del);

  const span = document.createElement("span");
  span.textContent = memo.text;
  div.appendChild(span);

  return div;
}


// ===================================================
// 메모 쓰는 칸
// 엔터를 누르면 담벼락에 붙습니다 (줄바꿈은 Shift + 엔터)
// ===================================================

const input = document.getElementById("input");

input.addEventListener("keydown", async function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    const saved = await addMemo(text);
    if (saved) {
      input.value = "";
      await render();
    }
  }
});


// 첫 화면 그리기
render();
input.focus();
