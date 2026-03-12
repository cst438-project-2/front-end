import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { auth } from '../lib/firebase';

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);

  const user = result.user;

  const token = await user.getIdToken();

  return { user, token };
}