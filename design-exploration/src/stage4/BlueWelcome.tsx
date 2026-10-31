import { Button } from '../components/Controls';
import { openStudy, type ScreenProps } from './studyTypes';
import './blue-polish.css';

export function BlueWelcome({ variant, mode }: Pick<ScreenProps, 'variant' | 'mode'>) {
  return (
    <section className="lens-welcome">
      <figure className="lens-cover">
        <img
          src="/assets/woven-landscape.png"
          alt="An illustrated Karnataka-inspired river valley with fine woven texture"
        />
        <figcaption>A field guide for the curious.</figcaption>
      </figure>
      <div className="lens-invitation">
        <p className="eyebrow">NORTHERN KARNATAKA</p>
        <h1>
          A little nearby.
          <br />A lot to discover.
        </h1>
        <p className="lens-intro">
          Quiet lakes. Stories in stone. Places shared by the people who know them.
        </p>
        <Button icon="arrow" onClick={() => openStudy('Map appearance', variant, mode)}>
          Plan my day
        </Button>
        <Button variant="quiet" onClick={() => openStudy('Map', variant, mode)}>
          Explore map
        </Button>
        <p className="lens-locations">
          Hubballi <span>·</span> Dharwad <span>·</span> Belagavi
        </p>
      </div>
    </section>
  );
}
