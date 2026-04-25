import { Renderer } from "./Renderer";
import { Input } from "./Input";

main();
async function main() {
    const theCanvas = document.querySelector("canvas")!;
    const controlsDiv = <HTMLDivElement>document.querySelector("#controls");

    const renderer = await Renderer.create(theCanvas);
    new Input(controlsDiv, renderer);

    renderer.render();
}
