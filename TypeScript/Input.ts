import { Renderer } from "./Renderer";

export class Input {
    // reference to the renderer

    private renderer: Renderer;

    // starting constants

    private static SIZE = 90;

    private static COLOR_H = 1.0/6.0;
    private static COLOR_S = 1.0;
    private static COLOR_L = 0.3;

    private static BACKGROUND_COLOR_H = 0.0;
    private static BACKGROUND_COLOR_S = 1.0;
    private static BACKGROUND_COLOR_L = 1.0;

    private static LIGHT_DIRECTION_X = -1.0;
    private static LIGHT_DIRECTION_Y = -1.0;
    private static LIGHT_DIRECTION_Z = 1.0;

    private static AMBIENT = 0.5;
    private static DIFFUSE = 1.0;
    private static SPECULAR = 4.0;
    private static SPECULAR_SHININESS = 4.5;

    // labels

    private sizeLabel: HTMLLabelElement;

    private colorHLabel: HTMLLabelElement;
    private colorSLabel: HTMLLabelElement;
    private colorLLabel: HTMLLabelElement;

    private backgroundColorHLabel: HTMLLabelElement;
    private backgroundColorSLabel: HTMLLabelElement;
    private backgroundColorLLabel: HTMLLabelElement;

    private lightDirectionXLabel: HTMLLabelElement;
    private lightDirectionYLabel: HTMLLabelElement;
    private lightDirectionZLabel: HTMLLabelElement;

    private ambientLabel: HTMLLabelElement;
    private diffuseLabel: HTMLLabelElement;
    private specularLabel: HTMLLabelElement;
    private specularShininessLabel: HTMLLabelElement;

    // vec3 values

    private colorH: number;
    private colorS: number;
    private colorL: number;

    private backgroundColorH: number;
    private backgroundColorS: number;
    private backgroundColorL: number;

    private lightDirectionX: number;
    private lightDirectionY: number;
    private lightDirectionZ: number;

    // save as png controls

    private resolutionInput: HTMLInputElement;

    constructor(controlsDiv: HTMLDivElement, renderer: Renderer) {
        this.renderer = renderer;

        window.onresize = () => renderer.resizeComputeTexture();

        this.renderer.size = Input.SIZE;
        this.sizeLabel = hydrateSlider("size", Input.SIZE.toString(), this.oninputSize);

        this.colorH = Input.COLOR_H;
        this.colorS = Input.COLOR_S;
        this.colorL = Input.COLOR_L;
        this.renderer.color = Input.HSLtoRGB(this.colorH, this.colorS, this.colorL);
        this.colorHLabel = hydrateSlider("color-h", Input.COLOR_H.toFixed(2), this.oninputColorH );
        this.colorSLabel = hydrateSlider("color-s", Input.COLOR_S.toFixed(2), this.oninputColorS );
        this.colorLLabel = hydrateSlider("color-l", Input.COLOR_L.toFixed(2), this.oninputColorL );

        this.backgroundColorH = Input.BACKGROUND_COLOR_H;
        this.backgroundColorS = Input.BACKGROUND_COLOR_S;
        this.backgroundColorL = Input.BACKGROUND_COLOR_L;
        this.renderer.backgroundColor = Input.HSLtoRGB(this.backgroundColorH, this.backgroundColorS, this.backgroundColorL);
        this.backgroundColorHLabel = hydrateSlider("background-color-h", Input.BACKGROUND_COLOR_H.toFixed(2), this.oninputBackgroundColorH );
        this.backgroundColorSLabel = hydrateSlider("background-color-s", Input.BACKGROUND_COLOR_S.toFixed(2), this.oninputBackgroundColorS );
        this.backgroundColorLLabel = hydrateSlider("background-color-l", Input.BACKGROUND_COLOR_L.toFixed(2), this.oninputBackgroundColorL );

        this.lightDirectionX = Input.LIGHT_DIRECTION_X;
        this.lightDirectionY = Input.LIGHT_DIRECTION_Y;
        this.lightDirectionZ = Input.LIGHT_DIRECTION_Z;
        this.renderer.lightDirection = [this.lightDirectionX, this.lightDirectionY, this.lightDirectionZ];
        this.lightDirectionXLabel = hydrateSlider("light-direction-x", Input.LIGHT_DIRECTION_X.toFixed(2), this.oninputLightDirectionX );
        this.lightDirectionYLabel = hydrateSlider("light-direction-y", Input.LIGHT_DIRECTION_Y.toFixed(2), this.oninputLightDirectionY );
        this.lightDirectionZLabel = hydrateSlider("light-direction-z", Input.LIGHT_DIRECTION_Z.toFixed(2), this.oninputLightDirectionZ );

        this.renderer.ambient = Input.AMBIENT;
        this.ambientLabel = hydrateSlider("ambient", Input.AMBIENT.toFixed(2), this.oninputAmbient);
        this.renderer.diffuse = Input.DIFFUSE;
        this.diffuseLabel = hydrateSlider("diffuse", Input.DIFFUSE.toFixed(2), this.oninputDiffuse);
        this.renderer.specular = Input.SPECULAR;
        this.specularLabel = hydrateSlider("specular", Input.SPECULAR.toFixed(2), this.oninputSpecular);
        this.renderer.specularShininess = Input.SPECULAR_SHININESS;
        this.specularShininessLabel = hydrateSlider("specular-shininess", Input.SPECULAR_SHININESS.toFixed(2), this.oninputSpecularShininess);

        this.resolutionInput = <HTMLInputElement>controlsDiv.querySelector("input[name=resolution]");
        this.resolutionInput.value = "1000";
        const saveAsPngDiv = <HTMLDivElement>controlsDiv.querySelector("#save-as-png");
        const saveAsPngButton = <HTMLButtonElement>saveAsPngDiv.querySelector("button");
        saveAsPngButton.onclick = this.onclickSaveAsPng;


        function hydrateSlider(name: string, value: string, oninput: (event: InputEvent) => void): HTMLLabelElement {
            const slider = <HTMLInputElement>controlsDiv.querySelector(`input[name=${name}]`);
            slider.value = value;
            slider.oninput = oninput;

            const label = <HTMLLabelElement>slider.nextElementSibling;
            label.textContent = value;
            return label;
        }
    }

    // oninput

    oninputSize = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.sizeLabel.textContent = value;
        this.renderer.size = Number(value);
        this.renderer.render();
    }


    oninputColorH = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.colorHLabel.textContent = value;
        this.colorH = Number(value);
        this.renderer.color = Input.HSLtoRGB(this.colorH, this.colorS, this.colorL);
        this.renderer.render();
    }

    oninputColorS = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.colorSLabel.textContent = value;
        this.colorS = Number(value);
        this.renderer.color = Input.HSLtoRGB(this.colorH, this.colorS, this.colorL);
        this.renderer.render();
    }

    oninputColorL = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.colorLLabel.textContent = value;
        this.colorL = Number(value);
        this.renderer.color = Input.HSLtoRGB(this.colorH, this.colorS, this.colorL);
        this.renderer.render();
    }


    oninputBackgroundColorH = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.backgroundColorHLabel.textContent = value;
        this.backgroundColorH = Number(value);
        this.renderer.backgroundColor = Input.HSLtoRGB(this.backgroundColorH, this.backgroundColorS, this.backgroundColorL);
        this.renderer.render();
    }

    oninputBackgroundColorS = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.backgroundColorSLabel.textContent = value;
        this.backgroundColorS = Number(value);
        this.renderer.backgroundColor = Input.HSLtoRGB(this.backgroundColorH, this.backgroundColorS, this.backgroundColorL);
        this.renderer.render();
    }

    oninputBackgroundColorL = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.backgroundColorLLabel.textContent = value;
        this.backgroundColorL = Number(value);
        this.renderer.backgroundColor = Input.HSLtoRGB(this.backgroundColorH, this.backgroundColorS, this.backgroundColorL);
        this.renderer.render();
    }


    oninputLightDirectionX = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.lightDirectionXLabel.textContent = value;
        this.lightDirectionX = Number(value);
        this.renderer.lightDirection = [this.lightDirectionX, this.lightDirectionY, this.lightDirectionZ];
        this.renderer.render();
    }

    oninputLightDirectionY = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.lightDirectionYLabel.textContent = value;
        this.lightDirectionY = Number(value);
        this.renderer.lightDirection = [this.lightDirectionX, this.lightDirectionY, this.lightDirectionZ];
        this.renderer.render();
    }

    oninputLightDirectionZ = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.lightDirectionZLabel.textContent = value;
        this.lightDirectionZ = Number(value);
        this.renderer.lightDirection = [this.lightDirectionX, this.lightDirectionY, this.lightDirectionZ];
        this.renderer.render();
    }


    oninputAmbient = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.ambientLabel.textContent = value;
        this.renderer.ambient = Number(value);
        this.renderer.render();
    }

    oninputDiffuse = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.diffuseLabel.textContent = value;
        this.renderer.diffuse = Number(value);
        this.renderer.render();
    }

    oninputSpecular = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.specularLabel.textContent = value;
        this.renderer.specular = Number(value);
        this.renderer.render();
    }

    oninputSpecularShininess = (event: InputEvent) => {
        const value = (<HTMLInputElement>event.target).value;
        this.specularShininessLabel.textContent = value;
        this.renderer.specularShininess = Number(value);
        this.renderer.render();
    }


    onclickSaveAsPng = (event: PointerEvent) => {
        const size: number = parseInt(this.resolutionInput.value);
        if (Number.isNaN(size) || size <= 0) {
            this.resolutionInput.value = "invalid";
            return;
        }
        this.resolutionInput.value = size.toString();

        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        this.renderer.renderToCanvas(canvas);

        canvas.toBlob((blob: Blob | null) => {
            const url = URL.createObjectURL(blob!);

            const a = document.createElement("a");
            a.href = url;
            a.download = "Sphere.png";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(url), 3000);
        });
    }


    // convertion functions

    private static HSLtoRGB(h: number, s: number, l: number): [r: number, g: number, b: number] {
        if (h == 1.0)
            h = 0.0;
        else
            h *= 360;

        let c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
        let x = c * (1.0 - Math.abs((h / 60.0) % 2.0 - 1.0));
        let m = l - c / 2;

        let r;
        let g;
        let b;
        if      (h <  60) { r =   c; g =   x; b = 0.0; }
        else if (h < 120) { r =   x; g =   c; b = 0.0; }
        else if (h < 180) { r = 0.0; g =   c; b =   x; }
        else if (h < 240) { r = 0.0; g =   x; b =   c; }
        else if (h < 300) { r =   x; g = 0.0; b =   c; }
        else if (h < 360) { r =   c; g = 0.0; b =   x; }
        else throw new Error("invalid hue");

        return [r + m, g + m, b + m];
    }

    private static RGBtoHSL(r: number, g: number, b: number): [h: number, s: number, l: number] {
        let cMax = Math.max(r, Math.max(g, b));
        let cMin = Math.min(r, Math.min(g, b));
        let delta = cMax - cMin;

        let h;
        let s;
        let l = (cMax + cMin) / 2;
        if (delta == 0.0) {
            h = 0.0;
            s = 0.0;
        }
        else {
            if (cMax == r)
                h = 60 * ((g - b) / delta % 6.0);
            else if (cMax == g)
                h = 60 * ((b - r) / delta + 2.0);
            else if (cMax == b)
                h = 60 * ((r - g) / delta + 4.0);
            else
                throw new Error("Not Reachable");

            s = delta / (1 - Math.abs(2 * l - 1));
        }

        return [h / 360.0, s, l];
    }
}
