// 키는 두 원소 ID를 알파벳순 정렬 후 '+'로 연결한 문자열
export const recipesData: Record<string, string[]> = {
  "fire+water":  ["steam"],
  "earth+water": ["mud"],
  "air+fire":    ["energy"],
  "air+water":   ["rain"],
  "earth+fire":  ["lava"],
  "air+earth":   ["dust"],
  "earth+rain":  ["plant"],
  "air+pressure": ["wind"], // wait, air+air = pressure
  "air+air": ["pressure"],
  "earth+pressure": ["stone"],
  "air+stone": ["sand"],
  "fire+sand": ["glass"],
  "glass+sand": ["time"],
};
