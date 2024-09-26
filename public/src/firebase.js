import { initializeApp } from 'firebase/app';
import { getToken, getMessaging, onMessage } from 'firebase/messaging';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { onBackgroundMessage } from 'firebase/messaging/sw';

const firebaseConfig = {
  apiKey: "AIzaSyCoZ07n5ivjCh5p7CRzkOFqh2QH4hV1RRI",
  authDomain: "notification-cf86e.firebaseapp.com",
  databaseURL: "https://notification-cf86e-default-rtdb.firebaseio.com",
  projectId: "notification-cf86e",
  storageBucket: "notification-cf86e.appspot.com",
  messagingSenderId: "541887693361",
  appId: "1:541887693361:web:d45c50cc0a7a2b544f8b10",
  measurementId: "G-FMZ1EN6264"
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
const messaging = getMessaging(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);


export const getOrRegisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    return window.navigator.serviceWorker
      .getRegistration('/firebase-push-notification-scope')
      .then((serviceWorker) => {
        if (serviceWorker) return serviceWorker;
        return window.navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-push-notification-scope',
        });
      });
  }
  throw new Error('The browser doesn`t support service worker.');
};

export const getFirebaseToken = () =>
  getOrRegisterServiceWorker()
    .then((serviceWorkerRegistration) =>
      getToken(messaging, { vapidKey: "BCG3sp_O4HBLD-bdzzYeQa05cxF5bgk_6OTTCZegBU0Hhfqc-0amXXUGNasASCCUsZMsz8rUfnMxtL9K4efiF6U", serviceWorkerRegistration }));

export const onForegroundMessage = () =>
  new Promise((resolve) => onMessage(messaging, (payload) => resolve(payload)));
