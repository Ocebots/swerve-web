import { Body, Bodies, Vector, Runner, Events } from "matter-js";
import Controller from "node-pid-controller";
import { Angle } from "./angle";

export class SwerveWheel {
  body: Body;
  pid_controller: Controller;
  speed: number = 0;
  log = false;

  constructor(runner: Runner, target_dir: Angle, pos: Vector) {
    this.body = Bodies.rectangle(pos.x, pos.y, 15, 40);

    this.body.collisionFilter.group = -1;

    this.pid_controller = new Controller(0.15, 0.0001, 0.001);
    this.pid_controller.setTarget(target_dir.degrees());

    this.body.frictionAir = 0.5;

    Events.on(runner, "afterTick", () => this.tick());
  }

  set_target_dir(angle: Angle) {
    this.pid_controller.setTarget(angle.normalize().degrees());
  }

  set_vector(vector: Vector) {
    if (Vector.magnitude(vector) != 0) {
      this.set_target_dir(
        Angle.vector(Vector.normalise(vector)).subtract(Angle.degrees(90))
      );
    }

    this.speed = Vector.magnitude(vector);
  }

  tick() {
    let body_angle = Angle.radians(this.body.angle).normalize();
    const target = Angle.degrees(this.pid_controller.target);

    let forward_body_angle = body_angle.get_closest(target);

    let rev_body_angle = body_angle.rev().get_closest(target);

    let final_body_angle = forward_body_angle;
    let rev = false;

    if (
      rev_body_angle.distance(target).degrees() <
      forward_body_angle.distance(target).degrees()
    ) {
      final_body_angle = rev_body_angle;
      rev = true;
    }

    Body.setAngularVelocity(
      this.body,
      this.pid_controller.update(final_body_angle.degrees()) / 15
    );

    if (
      final_body_angle
        .distance(Angle.degrees(this.pid_controller.target))
        .degrees() < 35
    ) {
      Body.applyForce(
        this.body,
        this.body.position,
        Vector.rotate({ x: 0, y: this.speed * (rev ? -1 : 1) }, this.body.angle)
      );
    }
  }
}
