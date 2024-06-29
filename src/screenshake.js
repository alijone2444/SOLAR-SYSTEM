import * as THREE from 'three';

function ScreenShake() {
    return {
        // When a function outside ScreenShake handles the camera, it should
        // always check that ScreenShake.enabled is false before.
        enabled: false,

        _timestampStart: undefined,
        _timestampEnd: undefined,
        _startPoint: undefined,
        _endPoint: undefined,

        // update(camera) must be called in the loop function of the renderer,
        // it will reposition the camera according to the requested shaking.
        update: function (camera) {
            if (this.enabled) {
                const now = Date.now();
                if (this._timestampEnd > now) {
                    let interval = (now - this._timestampStart) / (this._timestampEnd - this._timestampStart);
                    this.computePosition(camera, interval);
                } else {
                    camera.position.copy(this._startPoint);
                    this.enabled = false;
                }
            }
        },

        // This initializes the values of the shaking.
        // vecToAdd param is the offset of the camera position at the climax of its wave.
        shake: function (camera, vecToAdd, milliseconds) {
            this.enabled = true;
            this._timestampStart = Date.now();
            this._timestampEnd = this._timestampStart + milliseconds;
            this._startPoint = new THREE.Vector3().copy(camera.position);
            this._endPoint = new THREE.Vector3().addVectors(camera.position, vecToAdd);
        },

        computePosition: function (camera, interval) {
            // This creates the wavy movement of the camera along the interval.
            // The first block calls this.getQuadra() with a positive index between
            // 0 and 1, then the second calls it again with a negative index between
            // 0 and -1, etc. Variable position will get the sign of the index, and
            // get wavy.
            let position;
            if (interval < 0.4) {
                position = this.getQuadra(interval / 0.4);
            } else if (interval < 0.7) {
                position = this.getQuadra((interval - 0.4) / 0.3) * -0.6;
            } else if (interval < 0.9) {
                position = this.getQuadra((interval - 0.7) / 0.2) * 0.3;
            } else {
                position = this.getQuadra((interval - 0.9) / 0.1) * -0.1;
            }

            // Here the camera is positioned according to the wavy 'position' variable.
            camera.position.lerpVectors(this._startPoint, this._endPoint, position);
        },

        // This is a quadratic function that returns 0 at first, then returns 0.5 when t=0.5,
        // then returns 0 when t=1.
        getQuadra: function (t) {
            return 4 * t * (1 - t);
        }
    };
}

export default ScreenShake;
