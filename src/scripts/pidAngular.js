//Object Class for the object we are controlling the circular motion of. Gives the object angular properties.
class weight {
    constructor(theta = 0, omega = 0, alpha = 0) {
        //The objects rotation in radians.
        this.theta = theta;
        //The object angular velocity in radians/s.
        this.omega = omega;
        //The objects angular acceleration in radians/s^2
        this.alpha = alpha;
    }
}
//A class for the PID controller. Not fully implemented yet only proportional control so far.
class pid {
    //Initiliazes constants for PID  and sets a frequency for the controller
    constructor(proportionalGain, integralGain, derivativeGain, controlFrequency) {

        this.kP = proportionalGain;
        this.kI = integralGain;
        this.kD = derivativeGain;
        this.dt = 1000 / controlFrequency;
        //Sets initial vairables to zero need to find a better way to avoid exceptions
        this.output = 0;
        this.current = 0;
        this.target = 0;
        this.error = 0;
        
    }
    //The controll loop which runs repeatedly according to the refresh rate;
    controlLoop = function () {
      
        this.lastError = this.error;


        //First and foremost calculates error of the PID controller.
        this.error = this.target - this.current;
        //  console.log(this.error)

        //if (this.discon = true) {
        //    if (this.error > Math.PI) {
        //        this.error = -1 * Math.abs(2 * Math.PI - Math.abs(this.error));
        //    }
        //}
        this.output = this.proportional()

        // this.integrals += this.error;

        this.output += this.derivative()
       
    }

    proportional = function () {
        return this.kP * this.error;
    }
    
    integral = function () {
        return this.kI * this.integrals * this.dt;
    }

    derivative = function () {
        
        this.derivativeVal = this.kD * (this.error - this.lastError) / this.dt
        console.log(this.derivativeVal)
        return this.derivativeVal
    }
    //Sets the target of the pid controller
    set setTarget(val) {
        this.target = val;

    }

    //Sets the current of the pid controller
    set setCurrent(val) {
        this.current = val;
      
    }
 

}
(function () {
    var coordinateSystem, trackRadius;
    let object = new weight(0, 0, 0);
    let thetaPid = new pid(.03, 0, 0, 10);
    let omegaPid = new pid(.35, 0, 0, 10);
    window.onload = function () {
        cnvs = document.getElementById('cnvs');

        ctx = cnvs.getContext('2d');
        cnvs.addEventListener('mousemove', updateMouse);

        input = document.querySelector('input');
        input.addEventListener('change', updateValue);

       // window.addEventListener('resize', winch);
        winch();
        coordinateSystem = { 'x': cnvs.width / 2, 'y': cnvs.height / 2 };
        trackRadius = cnvs.height / 2.5;
        
        worldTick();
       // thetaPid.discon = true;
        setInterval(function () { thetaPid.controlLoop() }, thetaPid.dt);
        setInterval(function () { omegaPid.controlLoop() }, thetaPid.dt);
    };

    var mTheta;

    var updateMouse = function (e) {
        var x = 0;
        var y = 0;
        if (e.offsetX) {
            x = e.offsetX;
            y = e.offsetY;
        } else if (e.layerX) {
            x = e.layerX;
            y = e.layerY;
        }
        mouse = {
            'x': x - coordinateSystem['x'],
            'y': y - coordinateSystem['y']
        };
        
        mTheta = Math.atan2(mouse['y'], mouse['x']);
        thetaPid.setTarget = mTheta;
        document.getElementById('mouseTheta').innerHTML = mTheta;
    };

    var winch = function () {

        cnvs.width = (window.innerWidth) / 1.5;
        cnvs.height = (window.innerHeight - window.controls.offsetHeight)   ;
    };
  

    function updateValue(e) {
        targetTheta = e.target.value * Math.PI / 180
        thetaPid.setTarget = targetTheta;
    }
    var worldTick = function () {

        object.theta += object.omega

        thetaPid.current = object.theta

        omegaPid.setTarget = thetaPid.output

        object.omega += object.alpha

        omegaPid.current = object.omega

        object.alpha = omegaPid.output


        document.getElementById('objectTheta').innerHTML = object.theta;


        document.getElementById('objectOmega').innerHTML = object.omega;
        draw();
        window.requestAnimationFrame(worldTick);
    };


    var draw = function () {
        ctx.clearRect(0, 0, cnvs.width, cnvs.height);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coordinateSystem['x'], coordinateSystem['y'], 1, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(coordinateSystem['x'], coordinateSystem['y'], trackRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(coordinateSystem['x'] + trackRadius * 1.25 * Math.cos(object.theta), coordinateSystem['y'] + trackRadius * 1.25 * Math.sin(object.theta), 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();

    };
}).call(this);

