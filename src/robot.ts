import {
  Vector,
  Runner,
  Events,
  MouseConstraint,
  Mouse,
  Body,
} from "matter-js";
import { SwerveDrivetrain } from "./drivetrain";
import Controller from "node-pid-controller";

const linear_pid_config = {
  k_p: 0.007,
  k_i: 0.0001,
  k_d: 0.0001,
};

export class Robot {
  drivetrain: SwerveDrivetrain;
  x_pid = new Controller(linear_pid_config);
  y_pid = new Controller(linear_pid_config);
  turn_pid = new Controller(0.5, 0.001, 0.001);

  target_body: Body;

  was_driven_last_tick = false;

  constructor(
    runner: Runner,
    pos: Vector,
    mouse: MouseConstraint,
    target_body: Body
  ) {
    this.drivetrain = new SwerveDrivetrain(runner, pos);
    this.target_body = target_body;

    this.set_target_pos(pos);
    this.set_target_turn(0);

    Events.on(runner, "afterTick", () => this.tick());
    Events.on(mouse, "mousemove", (e: { mouse: Mouse }) => {
      this.set_target_pos(e.mouse.position);
    });

    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
          this.drivetrain.forward.y = -0.1;
          break;
        case "s":
          this.drivetrain.forward.y = 0.1;
          break;
        case "a":
          this.drivetrain.forward.x = -0.1;
          break;
        case "d":
          this.drivetrain.forward.x = 0.1;
          break;
        case "ArrowLeft":
          this.drivetrain.turn = -0.4;
          break;
        case "ArrowRight":
          this.drivetrain.turn = 0.4;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
        case "s":
          this.drivetrain.forward.y = 0;
          break;
        case "a":
        case "d":
          this.drivetrain.forward.x = 0;
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.drivetrain.turn = 0;
          break;
      }
    });
  }

  set_target_pos(pos: Vector) {
    this.x_pid.setTarget(pos.x);
    this.y_pid.setTarget(pos.y);
  }

  set_target_turn(angle: number) {
    this.turn_pid.setTarget(angle * (Math.PI / 180));
  }

  tick() {
    if (navigator.getGamepads()[0]) {
      this.drivetrain.forward = {
        x: deadzones(navigator.getGamepads()[0]?.axes[0]) / 5,
        y: deadzones(navigator.getGamepads()[0]?.axes[1]) / 5,
      };

      this.drivetrain.turn = deadzones(navigator.getGamepads()[0]?.axes[2]) / 2;

      if (
        Vector.magnitude(this.drivetrain.forward) != 0 ||
        this.drivetrain.turn != 0
      ) {
        this.was_driven_last_tick = true;
        return;
      } else if (this.was_driven_last_tick) {
        this.was_driven_last_tick = false;
        this.set_target_pos(this.drivetrain.body.position);
      }
    }

    // this.turn_pid.setTarget(
    //   Vector.angle(this.drivetrain.body.position, this.target_body.position)
    // );

    this.drivetrain.forward = {
      x: this.x_pid.update(this.drivetrain.body.position.x) / 5,
      y: this.y_pid.update(this.drivetrain.body.position.y) / 5,
    };

    this.drivetrain.turn = this.turn_pid.update(this.drivetrain.body.angle);
  }
}

function deadzones(value: number | undefined): number {
  if (Math.abs(value ?? 0) <= 0.2) {
    return 0;
  }

  return value ?? 0;
}
