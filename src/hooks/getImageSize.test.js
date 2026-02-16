import { getImageSize } from './getImageSize';

describe('getImageSize utility', () => {
  let originalImage;

  beforeAll(() => {
    originalImage = global.Image;
  });

  afterAll(() => {
    global.Image = originalImage;
  });

  it('resolves with dimensions when the image loads successfully', async () => {
    class FakeImage {
      constructor() {
        // simulate load on next tick
        setTimeout(() => {
          this.onload && this.onload();
        }, 0);
      }
      get naturalWidth() {
        return 200;
      }
      get naturalHeight() {
        return 150;
      }
      set src(v) {
        // ignore
      }
    }
    global.Image = FakeImage;

    const size = await getImageSize('dummy.png');
    expect(size).toEqual({ width: 200, height: 150 });
  });

  it('rejects when no url is provided', async () => {
    await expect(getImageSize('')).rejects.toThrow('no url provided');
  });

  it('rejects when image fails to load', async () => {
    class FakeImage2 {
      constructor() {
        setTimeout(() => {
          this.onerror && this.onerror(new Error('fail'));
        }, 0);
      }
      set src(v) {}
    }
    global.Image = FakeImage2;
    await expect(getImageSize('notfound.png')).rejects.toThrow('failed to load image: notfound.png');
  });
});
