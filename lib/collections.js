import { getDb } from "./mongo";
export async function colUsers() { return (await getDb()).collection("users"); }
export async function colInvestments() { return (await getDb()).collection("investments"); }
