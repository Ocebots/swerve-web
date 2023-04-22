import {
  Engine,
  Runner,
  Render,
  Composite,
  Bodies,
  MouseConstraint,
} from "matter-js";
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
    showDebug: true,
  },
});

const runner = Runner.create();

const mouse = MouseConstraint.create(engine);

const circle = Bodies.circle(500, 500, 50, { frictionAir: 0.04 });

const robot = new Robot(runner, { x: 700, y: 700 }, mouse, circle);

Composite.add(engine.world, [robot.drivetrain.object, circle, mouse]);

const wall_config = {
  collisionFilter: { group: -2 },
  isStatic: true,
};

Composite.add(engine.world, [
  Bodies.rectangle(
    0,
    window.innerHeight / 2,
    10,
    window.innerHeight,
    wall_config
  ),
  Bodies.rectangle(
    window.innerWidth,
    window.innerHeight / 2,
    10,
    window.innerHeight,
    wall_config
  ),
  Bodies.rectangle(
    window.innerWidth / 2,
    0,
    window.innerWidth,
    10,
    wall_config
  ),
  Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight,
    window.innerWidth,
    10,
    wall_config
  ),
]);

Render.run(renderer);

Runner.run(runner, engine);
