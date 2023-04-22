import { Vector } from "matter-js";

export class Angle {
  private internal_degrees: number;

  private constructor(degrees: number) {
    this.internal_degrees = degrees;
  }

  static radians(radians: number): Angle {
    return new Angle(radians * (180 / Math.PI));
  }

  static degrees(degrees: number): Angle {
    return new Angle(degrees);
  }

  static vector(vector: Vector) {
    if (vector.x == 0) {
      return vector.y > 0
        ? Angle.radians(Math.PI / 2)
        : Angle.radians((Math.PI * 3) / 2);
    }

    let angle = Math.atan(vector.y / vector.x);

    if (angle < 0) {
      angle = Math.PI * 2 + angle;
    }

    if (vector.x < 0) {
      return Angle.radians(angle - Math.PI).normalize();
    }

    return Angle.radians(angle).normalize();
  }

  radians(): number {
    return this.internal_degrees * (Math.PI / 180);
  }

  degrees(): number {
    return this.internal_degrees;
  }

  normalize(): Angle {
    let new_degrees: number = this.degrees();

    if (this.degrees() >= 360) {
      new_degrees = this.degrees() - Math.floor(this.degrees() / 360) * 360;
    } else if (this.degrees() < 0) {
      new_degrees =
        this.degrees() + (Math.floor(Math.abs(this.degrees()) / 360) + 1) * 360;
    }

    return Angle.degrees(new_degrees);
  }

  add(a: Angle): Angle {
    return Angle.degrees(a.degrees() + this.degrees());
  }

  subtract(a: Angle): Angle {
    return Angle.degrees(this.degrees() - a.degrees());
  }

  abs(): Angle {
    return Angle.degrees(Math.abs(this.degrees()));
  }

  distance(a: Angle): Angle {
    return a.subtract(this).abs();
  }

  get_closest(target: Angle): Angle {
    const current_distance = this.distance(target);
    const this_big = this.subtract(Angle.degrees(360)).distance(target);
    const them_big = this.add(Angle.degrees(360)).distance(target);

    if (
      this_big.degrees() < current_distance.degrees() &&
      this_big.degrees() < them_big.degrees()
    ) {
      return this.subtract(Angle.degrees(360));
    } else if (
      them_big.degrees() < current_distance.degrees() &&
      them_big.degrees() < this_big.degrees()
    ) {
      return this.add(Angle.degrees(360));
    }

    return this;
  }

  display(): string {
    return `${Math.round(this.degrees())}º`;
  }

  rev(): Angle {
    return this.add(Angle.degrees(180));
  }
}
