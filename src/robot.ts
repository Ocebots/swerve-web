import {
  Body,
  Bodies,
  Vector,
  Runner,
  Events,
  Composite,
  Constraint,
} from "matter-js";
import { SwerveWheel, vector_to_radians } from "./swerve_wheel";

const x_offset = 70;
const y_offset = 70;
const angle = 45;

const top_right: Vector = {
  x: x_offset,
  y: -1 * y_offset,
};
const top_left: Vector = {
  x: -1 * x_offset,
  y: -1 * y_offset,
};
const bottom_right: Vector = {
  x: x_offset,
  y: y_offset,
};
const bottom_left: Vector = {
  x: -1 * x_offset,
  y: y_offset,
};

export class Robot {
  body: Body;
  object: Composite;
  last_tick_time: number = Infinity;

  top_right_wheel: SwerveWheel;
  top_left_wheel: SwerveWheel;
  bottom_right_wheel: SwerveWheel;
  bottom_left_wheel: SwerveWheel;

  forward: Vector = {
    x: 0,
    y: 0,
  };
  turn: number = 0;

  constructor(runner: Runner, pos: Vector) {
    this.body = Bodies.rectangle(pos.x, pos.y, 200, 200);
    this.body.collisionFilter.group = -1;
    this.body.frictionAir = 0.5;

    this.top_right_wheel = new SwerveWheel(
      runner,
      angle,
      Vector.add(top_right, pos)
    );
    this.top_left_wheel = new SwerveWheel(
      runner,
      angle,
      Vector.add(top_left, pos)
    );
    this.bottom_right_wheel = new SwerveWheel(
      runner,
      angle,
      Vector.add(bottom_right, pos)
    );
    this.bottom_left_wheel = new SwerveWheel(
      runner,
      angle,
      Vector.add(bottom_left, pos)
    );

    this.object = Composite.create({
      bodies: [
        this.body,
        this.top_right_wheel.body,
        this.top_left_wheel.body,
        this.bottom_right_wheel.body,
        this.bottom_left_wheel.body,
      ],
      constraints: [
        Constraint.create({
          bodyA: this.body,
          bodyB: this.top_right_wheel.body,
          pointA: top_right,
        }),
        Constraint.create({
          bodyA: this.body,
          bodyB: this.top_left_wheel.body,
          pointA: top_left,
        }),
        Constraint.create({
          bodyA: this.body,
          bodyB: this.bottom_right_wheel.body,
          pointA: bottom_right,
        }),
        Constraint.create({
          bodyA: this.body,
          bodyB: this.bottom_left_wheel.body,
          pointA: bottom_left,
        }),
      ],
    });

    Events.on(runner, "afterTick", () => this.tick());

    window.addEventListener("gamepadconnected", () =>
      console.log(navigator.getGamepads())
    );

    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
          this.forward.y = -0.1;
          break;
        case "s":
          this.forward.y = 0.1;
          break;
        case "a":
          this.forward.x = -0.1;
          break;
        case "d":
          this.forward.x = 0.1;
          break;
        case "ArrowLeft":
          this.turn = -0.4;
          break;
        case "ArrowRight":
          this.turn = 0.4;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
        case "s":
          this.forward.y = 0;
          break;
        case "a":
        case "d":
          this.forward.x = 0;
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.turn = 0;
          break;
      }
    });
  }

  tick() {
    console.log(navigator.getGamepads()[0]?.axes);

    if (navigator.getGamepads()[0]) {
      this.forward = {
        x: deadzones(navigator.getGamepads()[0]?.axes[0]) / 5,
        y: deadzones(navigator.getGamepads()[0]?.axes[1]) / 5,
      };

      this.turn = deadzones(navigator.getGamepads()[0]?.axes[2]) / 2;
    }
    this.calculate_swerve(
      this.top_right_wheel,
      top_right,
      this.forward,
      this.turn
    );
    this.calculate_swerve(
      this.top_left_wheel,
      top_left,
      this.forward,
      this.turn
    );
    this.calculate_swerve(
      this.bottom_right_wheel,
      bottom_right,
      this.forward,
      this.turn
    );
    this.calculate_swerve(
      this.bottom_left_wheel,
      bottom_left,
      this.forward,
      this.turn
    );
  }

  calculate_swerve(
    wheel: SwerveWheel,
    relative_position: Vector,
    forward: Vector,
    turn: number
  ) {
    const turn_vector = Vector.mult(
      Vector.rotate(Vector.normalise(relative_position), Math.PI / 2),
      turn
    );

    wheel.set_vector(Vector.add(turn_vector, forward));
  }

  speed(speed: number) {
    this.top_right_wheel.speed = speed;
    this.top_left_wheel.speed = speed;
    this.bottom_right_wheel.speed = speed;
    this.bottom_left_wheel.speed = speed;
  }
}

function deadzones(value: number | undefined): number {
  if (Math.abs(value ?? 0) <= 0.2) {
    return 0;
  }

  return value ?? 0;
}