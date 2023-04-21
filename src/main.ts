import { Engine, Runner, Render, Bodies, Composite, Body } from "matter-js";
import "./styles.css";
// import { SwerveWheel } from "./swerve_wheel";
import { Robot } from "./robot";

const engine = Engine.create();

engine.gravity.scale = 0;

const renderer = Render.create({
  engine: engine,
  element: document.body,
  options: {
    height: window.innerHeight,
    width: window.innerWidth,
    showAngleIndicator: true,
    showVelocity: true,
  },
});

const runner = Runner.create();

const robot = new Robot(runner, { x: 200, y: 200 });

Composite.add(engine.world, [robot.object]);

Render.run(renderer);

Runner.run(runner, engine);
