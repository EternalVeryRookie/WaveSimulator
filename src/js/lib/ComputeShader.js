//WebGL2のComputeShaderを取り扱うクラス

//シェーダーのコンパイルとリンクを行う
function initShader(offscreenCtx, shaderSource) {
    const shader = offscreenCtx.createShader(offscreenCtx.COMPUTE_SHADER);
    const program = offscreenCtx.createProgram();

    offscreenCtx.shaderSource(shader, shaderSource);
    offscreenCtx.compileShader(shader);

    if(!offscreenCtx.getShaderParameter(shader, offscreenCtx.COMPILE_STATUS)){
        alert(offscreenCtx.getShaderInfoLog(shader));
        throw new Error(offscreenCtx.getShaderInfoLog(shader));
    }

    offscreenCtx.attachShader(program, shader);
    offscreenCtx.linkProgram(program);

    if(!offscreenCtx.getProgramParameter(program, offscreenCtx.LINK_STATUS)){
        alert(offscreenCtx.getProgramInfoLog(program));
        throw new Error(offscreenCtx.getProgramInfoLog(program));
    }

    offscreenCtx.deleteShader(shader);
    //offscreenCtx.deleteProgram(program);

    return program;
}

class ShaderStorageBuffer{
    constructor(offscreenCtx) {
        this.Number = offscreenCtx.createBuffer();
    }

    set(offscreenCtx, typeArray, usageDataStore) {
        offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, this.Number);
        offscreenCtx.bufferData(offscreenCtx.SHADER_STORAGE_BUFFER, typeArray, usageDataStore);
        offscreenCtx.bindBuffer(offscreenCtx.SHADER_STORAGE_BUFFER, null);    
    }
}

export default class ComputeShader {
    constructor(shaderSource) {
        this.OffscreenCtx = new OffscreenCanvas(1, 1).getContext("webgl2-compute");
        if (!this.OffscreenCtx)
            alert("webgl2-compute unsupported");    

        this.__Buffers = new Map();
        this.__ShaderProgram = initShader(this.OffscreenCtx, shaderSource);
    }

    createBuffer(name, bindingNumber) {
        if (this.__Buffers.has(name))
            return false;        
            
        this.OffscreenCtx.useProgram(this.__ShaderProgram);
        
        const SSBO = new ShaderStorageBuffer(this.OffscreenCtx);
        this.__Buffers.set(name, SSBO);
        this.OffscreenCtx.bindBufferBase(this.OffscreenCtx.SHADER_STORAGE_BUFFER, bindingNumber, SSBO.Number);       

        this.OffscreenCtx.useProgram(null);

        return true;
    }

    sendDataToGPU(typeArray, usageDataStore, bufferName) {
        if (!this.__Buffers.has(bufferName)) 
            return false;

        const SSBO = this.__Buffers.get(bufferName);
        this.OffscreenCtx.useProgram(this.__ShaderProgram);
        SSBO.set(this.OffscreenCtx, typeArray, usageDataStore);
        this.OffscreenCtx.useProgram(null);

        return true;
    }

    readDataFromGPU(dstArray, bufferName) {
        if (!this.__Buffers.has(bufferName)) 
            return false;

        const SSBO = this.__Buffers.get(bufferName);
        this.OffscreenCtx.bindBuffer(this.OffscreenCtx.SHADER_STORAGE_BUFFER, SSBO.Number);
        this.OffscreenCtx.getBufferSubData(this.OffscreenCtx.SHADER_STORAGE_BUFFER, 0, dstArray);
        this.OffscreenCtx.bindBuffer(this.OffscreenCtx.SHADER_STORAGE_BUFFER, null);
    }

    dispatch(numGroupX, numGroupY, numGroupZ) {
        this.OffscreenCtx.useProgram(this.__ShaderProgram);
        this.OffscreenCtx.dispatchCompute(numGroupX, numGroupY, numGroupZ);
        this.OffscreenCtx.useProgram(null);
    }
}