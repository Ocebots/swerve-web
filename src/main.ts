import { Engine, Runner, Render, Composite, Bodies } from "matter-js";
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

Composite.add(engine.world, [
  robot.object,
  Bodies.circle(500, 500, 50, { frictionAir: 0.04 }),
]);

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
