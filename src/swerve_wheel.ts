import { Body, Bodies, Vector, Runner, Events } from "matter-js";
import Controller from "node-pid-controller";

export class SwerveWheel {
  body: Body;
  pid_controller: Controller;
  speed: number = 0;

  constructor(runner: Runner, target_dir: number, pos: Vector) {
    this.body = Bodies.rectangle(pos.x, pos.y, 15, 40);

    this.body.collisionFilter.group = -1;

    this.pid_controller = new Controller(0.15, 0.0001, 0.001);
    this.pid_controller.setTarget(target_dir);

    this.body.frictionAir = 0.5;

    Events.on(runner, "afterTick", () => this.tick());
  }

  set_target_dir(angle: number) {
    this.pid_controller.setTarget(angle);
  }

  set_vector(vector: Vector) {
    this.set_target_dir(
      vector_to_radians(Vector.normalise(vector)) * (180 / Math.PI) - 90
    );
    this.speed = Vector.magnitude(vector);
  }

  tick() {
    let body_angle = this.body.angle * (180 / Math.PI);

    while (body_angle < 0) {
      body_angle = body_angle + 360;
    }

    while (body_angle >= 360) {
      body_angle = body_angle - 360;
    }

    const normal_distance = Math.abs(body_angle - this.pid_controller.target);
    const body_small_distance = Math.abs(
      body_angle + 360 - this.pid_controller.target
    );
    const body_big_distance = Math.abs(
      body_angle - (this.pid_controller.target + 360)
    );

    if (
      normal_distance < body_small_distance &&
      normal_distance < body_big_distance
    ) {
      Body.setAngularVelocity(
        this.body,
        this.pid_controller.update(body_angle) / 15
      );
    } else if (
      body_small_distance < normal_distance &&
      body_small_distance < body_big_distance
    ) {
      Body.setAngularVelocity(
        this.body,
        this.pid_controller.update(body_angle + 360) / 15
      );
    } else {
      this.pid_controller.setTarget(this.pid_controller.target + 360);
      Body.setAngularVelocity(
        this.body,
        this.pid_controller.update(body_angle) / 15
      );
    }

    Body.applyForce(
      this.body,
      this.body.position,
      Vector.rotate({ x: 0, y: this.speed }, this.body.angle)
    );
  }
}

export function vector_to_radians(vector: Vector): number {
  if (vector.x == 0) {
    return vector.y > 0 ? Math.PI / 2 : (Math.PI * 3) / 2;
  }

  let angle = Math.atan(vector.y / vector.x);

  if (angle < 0) {
    angle = Math.PI * 2 + angle;
  }

  if (vector.x < 0) {
    return angle - Math.PI;
  }

  return angle;
}
