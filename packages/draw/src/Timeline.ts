import { Shape } from './Shape';

interface TimelineOptions {
  items: TimelineItem[];
  loop?: boolean;
}

interface TimelineItem {
  duration: number;
  render: () => Shape;
}

export class Timeline extends Shape {
  items: TimelineItem[];
  loop: boolean;
  private started: number;

  constructor(options: TimelineOptions) {
    super();
    this.items = options.items;
    this.loop = options.loop || false;
    this.started = Date.now();
  }

  reset() {
    this.started = Date.now();
  }

  getItem() {
    const now = Date.now();
    const diffInMs = now - this.started;
    let currentMs = 0;
    const currentItem = this.items.find((item) => {
      const oldMs = currentMs;
      const newMs = (currentMs += item.duration);
      return diffInMs >= oldMs && diffInMs <= newMs;
    });
    if (this.loop && !currentItem) {
      this.reset();
    }
    return currentItem;
  }

  draw(resolution: number) {
    const item = this.getItem();
    if (item) {
      return item.render().draw(resolution);
    } else {
      return [];
    }
  }
}
