import "./style.css";

import Experience from "./TileFloor/Experience";

const canvas = document.querySelector("#app");
console.log(canvas);
if (canvas) {
  const experience = new Experience(canvas);
}
