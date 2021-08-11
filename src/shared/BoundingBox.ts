import { Vec3 } from 'vec3';
export default class BoundingBox {
  min: Vec3;
  max: Vec3;

  constructor(min: Vec3, max: Vec3) {
    this.min = min;
    this.max = max;
  }

  static fromPositionSize(pos: Vec3, size: Vec3) {
    return (
      new BoundingBox(
        //min
        new Vec3(pos.x - size.x / 2,
          pos.y - size.y / 2,
          pos.z - size.z / 2),
        //max
        new Vec3(pos.x + size.x / 2,
          pos.y + size.y / 2,
          pos.z + size.z / 2)
      )
    )
  }

  static fromPoints(points: Vec3[]) {
    const box = new BoundingBox(
      points[0].clone(),
      points[0].clone()
    );

    points.forEach(box.addPoint.bind(box));

    return box;
  }

  isEmpty() {
    if (!this.min || !this.max) return true;
    else return false;
  }

  addPoint(p: Vec3) {
    if (this.isEmpty()) {
      this.min = p.clone();
      this.max = p.clone();
    }
    if (p.x < this.min.x) this.min.x = p.x;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p.x > this.max.x) this.max.x = p.x;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
  }

  getSize() {
    return new Vec3(
      this.max.x - this.min.x,
      this.max.y - this.min.y,
      this.max.z - this.min.z
    );
  }

  getCenter() {
    return new Vec3(
      this.min.x + (this.max.x - this.min.x) / 2,
      this.min.y + (this.max.y - this.min.y) / 2,
      this.min.z + (this.max.z - this.min.z) / 2
    );
  }

  contains(p: Vec3) {
    return (
      (p.x >= this.min.x && p.x <= this.max.x) &&
      (p.y >= this.min.y && p.y <= this.max.y) &&
      (p.z >= this.min.z && p.z <= this.max.z)
    );
  }
}