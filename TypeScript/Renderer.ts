import SHADER_CODE from "./Shader/shader.wgsl";

export class Renderer {
    private static COLOR_FORMAT: GPUTextureFormat = "rgba8unorm";

    // environment/window
    private htmlCanvas: HTMLCanvasElement;
    private canvasContext: GPUCanvasContext;
    private gpuAdapter: GPUAdapter;
    private device: GPUDevice;

    // assets
    private computeTexture: GPUTexture;

    // pipeline
    private bindGroupLayout: GPUBindGroupLayout;
    private gpuBindGroup: GPUBindGroup;
    private computePipeline: GPUComputePipeline;

    // gpu uniforms
    private sizeUniform: GPUBuffer;                 // range(0..100): integer size the sphere in %
    private colorUniform: GPUBuffer;                // range(0..1):   vec3 rgb color of sphere
    private backgroundColorUnifrom: GPUBuffer;      // range(0..1):   vec3 rgb color of background
    private lightDirectionUniform: GPUBuffer;       // range(-1..1):  vec3 light direction
    private ambientUniform: GPUBuffer;              // range(0..1):   float ambient
    private diffuseUniform: GPUBuffer;              // range(0..10):  float ambient
    private specularUniform: GPUBuffer;             // range(0..10):  float ambient
    private specularShininessUniform: GPUBuffer;    // range(0..10):  float ambient


    // construction

    public static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
        // browser support
        if (navigator.gpu === undefined)
            throw new Error("WebGPU is not supported/enabled in your browser");

        // gpu device
        const gpuAdapter = (await navigator.gpu.requestAdapter())!;
        const device = await gpuAdapter.requestDevice();

        // compile shader module
        const shaderModule = device.createShaderModule({code: SHADER_CODE});
        {
            const compilationInfo = await shaderModule.getCompilationInfo();
            for (const message of compilationInfo.messages)
                if (message.type === "error")
                    throw new Error("aborted => shader module compilation error(s)");
        }

        return new Renderer(canvas, gpuAdapter, device, shaderModule);
    }

    private constructor(canvas: HTMLCanvasElement, gpuAdapter: GPUAdapter, device: GPUDevice, shaderModule: GPUShaderModule) {
        this.htmlCanvas = canvas;
        this.gpuAdapter = gpuAdapter;
        this.device = device;

        this.canvasContext = this.htmlCanvas.getContext("webgpu")!;
        this.canvasContext.configure({
            device: this.device,
            format: Renderer.COLOR_FORMAT,
            alphaMode: "opaque",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
            colorSpace: "srgb"
        });


        // assets
        this.computeTexture = this.createComputeTexture(this.htmlCanvas);

        // uniforms
        this.sizeUniform = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.colorUniform = device.createBuffer({ size: 3 * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.backgroundColorUnifrom = device.createBuffer({ size: 3 * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.lightDirectionUniform = device.createBuffer({ size: 3 * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.ambientUniform = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.diffuseUniform = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.specularUniform = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.specularShininessUniform = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });


        // pipeline

        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                /* output texture */ {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: Renderer.COLOR_FORMAT,
                        viewDimension: "2d"
                    }
                },
                /* sizeUniform              */ { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* colorUniform             */ { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* backgroundColorUnifrom   */ { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* lightDirectionUniform    */ { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* ambientUniform           */ { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* diffuseUniform           */ { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* specularUniform          */ { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: {} },
                /* specularShininessUniform */ { binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: {} }
            ]
        });

        this.gpuBindGroup = this.createBindGroup(this.computeTexture);

        this.computePipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.bindGroupLayout]
            }),
            compute: {
                module: shaderModule,
                entryPoint: "main"
            }
        });
    }


    // render functions

    public render() {
        const commandEncoder = this.device.createCommandEncoder();

        const renderPassEncoder = commandEncoder.beginComputePass();
        renderPassEncoder.setPipeline(this.computePipeline);
        renderPassEncoder.setBindGroup(0, this.gpuBindGroup);
        renderPassEncoder.dispatchWorkgroups(this.computeTexture.width, this.computeTexture.height, 1);
        renderPassEncoder.end();

        const resolveTexture: GPUTexture = this.canvasContext.getCurrentTexture();
        commandEncoder.copyTextureToTexture({ texture: this.computeTexture }, { texture: resolveTexture }, { width: resolveTexture.width, height: resolveTexture.height });

        this.device.queue.submit([commandEncoder.finish()]);
    }

    public renderToCanvas(canvas: HTMLCanvasElement) {
        // configure resources

        const canvasContext = canvas.getContext("webgpu")!;
        canvasContext.configure({
            device: this.device,
            format: Renderer.COLOR_FORMAT,
            alphaMode: "opaque",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
        });

        const computeTexture = this.createComputeTexture(canvas);
        const gpuBindGroup = this.createBindGroup(computeTexture);


        // render

        const commandEncoder = this.device.createCommandEncoder();

        const renderPassEncoder = commandEncoder.beginComputePass();
        renderPassEncoder.setPipeline(this.computePipeline);
        renderPassEncoder.setBindGroup(0, gpuBindGroup);
        renderPassEncoder.dispatchWorkgroups(computeTexture.width, computeTexture.height, 1);
        renderPassEncoder.end();

        const resolveTexture: GPUTexture = canvasContext.getCurrentTexture();
        commandEncoder.copyTextureToTexture({ texture: computeTexture }, { texture: resolveTexture }, { width: resolveTexture.width, height: resolveTexture.height });

        this.device.queue.submit([commandEncoder.finish()]);
    }


    // create/set functions

    private createComputeTexture(canvas: HTMLCanvasElement): GPUTexture {
        const rect = canvas.getBoundingClientRect();
        const rectMax = rect.width > rect.height ? rect.width : rect.height;
        if (rectMax > 0.0) {
            canvas.width = rectMax;
            canvas.height = rectMax;
        }

        return this.device.createTexture({
            size: {
                width: canvas.width,
                height: canvas.height
            },
            format: Renderer.COLOR_FORMAT,
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
        });
    }

    private createBindGroup(computeTexture: GPUTexture) {
        return this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                /* output texture */ { binding: 0, resource: computeTexture.createView() },
                /* sizeUniform              */   { binding: 1, resource: { buffer: this.sizeUniform } },
                /* colorUniform             */   { binding: 2, resource: { buffer: this.colorUniform } },
                /* backgroundColorUnifrom   */   { binding: 3, resource: { buffer: this.backgroundColorUnifrom } },
                /* lightDirectionUniform    */   { binding: 4, resource: { buffer: this.lightDirectionUniform } },
                /* ambientUniform           */   { binding: 5, resource: { buffer: this.ambientUniform } },
                /* diffuseUniform           */   { binding: 6, resource: { buffer: this.diffuseUniform } },
                /* specularUniform          */   { binding: 7, resource: { buffer: this.specularUniform } },
                /* specularShininessUniform */   { binding: 8, resource: { buffer: this.specularShininessUniform } }
            ]
        });
    }


    public resizeComputeTexture() {
        const rect = this.htmlCanvas.getBoundingClientRect();
        if (this.htmlCanvas.width == rect.width || this.htmlCanvas.height == rect.height)
            return;

        this.computeTexture.destroy();
        this.computeTexture = this.createComputeTexture(this.htmlCanvas);
        this.gpuBindGroup = this.createBindGroup(this.computeTexture);
    }

    public set size              (value: number)                            { this.device.queue.writeBuffer(this.sizeUniform,              0, new Int32Array([value]));   }
    public set color             (value: [r: number, g: number, b: number]) { this.device.queue.writeBuffer(this.colorUniform,             0, new Float32Array(value));   }
    public set backgroundColor   (value: [r: number, g: number, b: number]) { this.device.queue.writeBuffer(this.backgroundColorUnifrom,   0, new Float32Array(value));   }
    public set lightDirection    (value: [x: number, y: number, z: number]) { this.device.queue.writeBuffer(this.lightDirectionUniform,    0, new Float32Array(value));   }
    public set ambient           (value: number)                            { this.device.queue.writeBuffer(this.ambientUniform,           0, new Float32Array([value])); }
    public set diffuse           (value: number)                            { this.device.queue.writeBuffer(this.diffuseUniform,           0, new Float32Array([value])); }
    public set specular          (value: number)                            { this.device.queue.writeBuffer(this.specularUniform,          0, new Float32Array([value])); }
    public set specularShininess (value: number)                            { this.device.queue.writeBuffer(this.specularShininessUniform, 0, new Float32Array([value])); }
}
