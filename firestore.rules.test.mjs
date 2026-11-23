import { readFile } from "node:fs/promises";
import { after, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const projectId = "demo-alifly-rules";
const rules = await readFile(new URL("./firestore.rules", import.meta.url), "utf8");
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function profileDocument() {
  return {
    email: "alice@example.com",
    avatarId: "duck",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function progressDocument() {
  return {
    completed_lesson_ids: [1, 2],
    mistakes: [],
    streak: 1,
    last_study_date: "2026-11-20",
    exam_passed: false,
    daily_goal: 1,
    daily_activity: { date: "2026-11-20", lessonIds: [1] },
    updated_at: serverTimestamp(),
  };
}

test("unauthenticated visitors cannot read a learner profile", async () => {
  const guest = testEnv.unauthenticatedContext();
  await assertFails(getDoc(doc(guest.firestore(), "users/alice")));
});

test("a learner can create and read their own allowlisted profile", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });
  const profileRef = doc(alice.firestore(), "users/alice");

  await assertSucceeds(setDoc(profileRef, profileDocument()));
  await assertSucceeds(getDoc(profileRef));
});

test("the current ALIFLY email sign-up profile works without avatarId", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  // Mirrors AuthPanel.tsx: createUserWithEmailAndPassword followed by setDoc.
  await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), {
    email: "alice@example.com",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  // The current app may later update a timestamp without having an avatar field.
  await assertSucceeds(updateDoc(doc(alice.firestore(), "users/alice"), {
    updatedAt: serverTimestamp(),
  }));
});

test("a learner cannot add trial or subscription fields to their profile", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  await assertFails(setDoc(doc(alice.firestore(), "users/alice"), {
    ...profileDocument(),
    trialEndsAt: Timestamp.fromDate(new Date("2026-11-27T00:00:00Z")),
    isPremium: true,
  }));
});

test("a learner can change their avatar but cannot edit protected profile fields", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });
  const profileRef = doc(alice.firestore(), "users/alice");

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users/alice"), {
      email: "alice@example.com",
      avatarId: "duck",
      createdAt: Timestamp.fromDate(new Date("2026-11-20T00:00:00Z")),
      updatedAt: Timestamp.fromDate(new Date("2026-11-20T00:00:00Z")),
    });
  });

  await assertSucceeds(updateDoc(profileRef, {
    avatarId: "owl",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(profileRef, {
    email: "someone-else@example.com",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(profileRef, {
    trialEndsAt: Timestamp.fromDate(new Date("2026-11-27T00:00:00Z")),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(profileRef, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
});

test("a learner cannot read another learner's profile", async () => {
  const alice = testEnv.authenticatedContext("alice");
  const bob = testEnv.authenticatedContext("bob");

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users/alice"), {
      avatarId: "duck",
      updatedAt: Timestamp.fromDate(new Date("2026-11-20T00:00:00Z")),
    });
  });

  await assertFails(getDoc(doc(bob.firestore(), "users/alice")));
  await assertSucceeds(getDoc(doc(alice.firestore(), "users/alice")));
});

test("learners cannot list the profiles collection", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertFails(getDocs(collection(alice.firestore(), "users")));
});

test("a learner cannot create a profile with an avatar outside the allowlist", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  await assertFails(setDoc(doc(alice.firestore(), "users/alice"), {
    ...profileDocument(),
    avatarId: "dragon",
  }));
});

test("a learner cannot create a profile with another email address", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  await assertFails(setDoc(doc(alice.firestore(), "users/alice"), {
    ...profileDocument(),
    email: "bob@example.com",
  }));
});

test("a learner cannot choose a client-controlled profile creation timestamp", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  await assertFails(setDoc(doc(alice.firestore(), "users/alice"), {
    ...profileDocument(),
    createdAt: Timestamp.fromDate(new Date("2020-01-01T00:00:00Z")),
  }));
});

test("a learner can create their own current progress document", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertSucceeds(setDoc(
    doc(alice.firestore(), "users/alice/progress/current"),
    progressDocument(),
  ));
});

test("a learner cannot read another learner's progress", async () => {
  const alice = testEnv.authenticatedContext("alice");
  const bob = testEnv.authenticatedContext("bob");

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "users/alice/progress/current"),
      progressDocument(),
    );
  });

  await assertFails(getDoc(doc(bob.firestore(), "users/alice/progress/current")));
  await assertSucceeds(getDoc(doc(alice.firestore(), "users/alice/progress/current")));
});

test("progress writes reject unknown or server-owned fields", async () => {
  const alice = testEnv.authenticatedContext("alice");

  await assertFails(setDoc(
    doc(alice.firestore(), "users/alice/progress/current"),
    {
      ...progressDocument(),
      trialEndsAt: Timestamp.fromDate(new Date("2026-11-27T00:00:00Z")),
    },
  ));
});

test("progress writes reject an unsupported daily goal", async () => {
  const alice = testEnv.authenticatedContext("alice");

  await assertFails(setDoc(
    doc(alice.firestore(), "users/alice/progress/current"),
    {
      ...progressDocument(),
      daily_goal: 99,
    },
  ));
});

test("learners cannot delete their progress document", async () => {
  const alice = testEnv.authenticatedContext("alice");
  const progressRef = doc(alice.firestore(), "users/alice/progress/current");

  await assertSucceeds(setDoc(progressRef, progressDocument()));
  await assertFails(deleteDoc(progressRef));
});

test("unlisted nested collections are denied by default", async () => {
  const alice = testEnv.authenticatedContext("alice");

  await assertFails(setDoc(
    doc(alice.firestore(), "users/alice/trial/current"),
    { trialEndsAt: Timestamp.fromDate(new Date("2026-11-27T00:00:00Z")) },
  ));
});

test("a learner cannot create a profile for another user", async () => {
  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" });

  await assertFails(setDoc(doc(alice.firestore(), "users/bob"), profileDocument()));
});
