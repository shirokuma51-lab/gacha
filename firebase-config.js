// ============================================================================
// firebase-config.js
// ----------------------------------------------------------------------------
// ここに自分の Firebase プロジェクトの設定値を入れてください。
// Firebaseコンソール → プロジェクトの設定 → 全般 → 「マイアプリ」→
// ウェブアプリ（</>アイコン）を追加すると、下記と同じ形の値が発行されます。
//
// 既存の別プロジェクトを流用してもOKです。その場合コレクション名が衝突
// しないよう、このシステムでは "gacha_posts" というやや固有な名前を
// 使っています（他のアプリと同じプロジェクトでも基本的に問題ありません）。
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAsNheRDdFAjvsWl_lJ5g27gGccQ69LrDc",
  authDomain: "gacha-ea7be.firebaseapp.com",
  projectId: "gacha-ea7be",
  storageBucket: "gacha-ea7be.firebasestorage.app",
  messagingSenderId: "34887662229",
  appId: "1:34887662229:web:c4450a71b642d02dc0799c",
  measurementId: "G-VBH1MXC8ER"
};

// Firebase JS SDK (modular / v10系) をCDNから読み込む。
// バージョンは適宜最新に差し替えてOKです。
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore, collection, query, where, orderBy, limit,
  onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db, collection, query, where, orderBy, limit,
  onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp
};
