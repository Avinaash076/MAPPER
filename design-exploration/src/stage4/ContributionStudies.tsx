import { useState } from 'react';
import { Button, Field, Photo, StatusMessage } from '../components/Controls';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { places } from '../data';
import { openStudy, type ScreenProps } from './studyTypes';

export function ContributionStudy(props: ScreenProps) {
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState('');
  const stepped = props.variant === 1;
  return (
    <section className="contribution-study">
      <div className="contribution-intro">
        <p className="eyebrow">THE MAP GROWS WITH YOU</p>
        <h1>
          Some places
          <br />
          need a local.
        </h1>
        <p>Your photographs and notes can help someone discover a place worth knowing.</p>
        <StatusMessage kind="information" title="Private until reviewed">
          Captured coordinates remain private. A reviewer chooses a suitable public location before
          publication.
        </StatusMessage>
      </div>
      <div className="contribution-form">
        {stepped && (
          <div className="step-tabs">
            {['Location', 'Photos', 'Story'].map((label, index) => (
              <button key={label} aria-pressed={step === index} onClick={() => setStep(index)}>
                {label}
              </button>
            ))}
          </div>
        )}
        <div hidden={stepped && step !== 0} className="contribution-location">
          <Field label="Place name" placeholder="What do you call this place?" />
          <Button
            variant="secondary"
            icon="locate"
            onClick={() =>
              setNotice(
                'Location action preview: the app would ask for permission and show accuracy before saving. No coordinates were captured.',
              )
            }
          >
            Use current location
          </Button>
          <p className="muted">
            Keep captured location separate from the public pin. Do not expose sensitive or private
            places.
          </p>
          <div className="map-banner">
            <MapPreview appearance={props.appearance} />
          </div>
        </div>
        <div hidden={stepped && step !== 1} className="contribution-photos">
          <label className="photo-drop">
            <Icon name="camera" size={32} />
            <strong>Add your photographs</strong>
            <small>Use your own photographs; avoid faces and private details.</small>
            <input type="file" accept="image/*" multiple />
            <small>Preview only: files are not sent or stored.</small>
          </label>
        </div>
        <div hidden={stepped && step !== 2} className="contribution-story">
          <label className="study-label">
            Your notes
            <textarea
              rows={4}
              placeholder="What makes it special? Mention access or permission information you know."
            />
          </label>
          <label className="study-label">
            Category
            <select>
              <option>Nature</option>
              <option>Heritage</option>
              <option>Waterfalls</option>
              <option>Spiritual</option>
              <option>Activities</option>
            </select>
          </label>
        </div>
        <Button
          onClick={() =>
            stepped && step < 2
              ? setStep(step + 1)
              : setNotice(
                  'Review example: your submission would stay private until administrator approval. This prototype has not submitted anything.',
                )
          }
        >
          {stepped && step < 2 ? 'Next' : 'Preview submission'}
        </Button>
        {notice && (
          <StatusMessage kind="information" title="Prototype action">
            {notice}
          </StatusMessage>
        )}
        <Button
          variant="quiet"
          onClick={() => openStudy('Drafts & review', props.variant, props.mode)}
        >
          See draft & review states
        </Button>
      </div>
    </section>
  );
}

const reviewExamples = [
  {
    status: 'Private draft',
    name: 'My lakeside discovery',
    note: 'Only you can see this. Add photos when ready.',
    action: 'Continue draft',
    icon: 'bookmark',
  },
  {
    status: 'Pending review',
    name: 'A local heritage corner',
    note: 'Waiting for an administrator. Not public.',
    action: 'View submission',
    icon: 'clock',
  },
  {
    status: 'Approved',
    name: 'Community place example',
    note: 'Published after review. Current access still needs checking.',
    action: 'View public example',
    icon: 'check',
  },
  {
    status: 'Needs changes',
    name: 'Waterfall viewpoint',
    note: 'Reviewer asks for clearer location information.',
    action: 'Update details',
    icon: 'warning',
  },
] as const;

export function ReviewStudy(props: ScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  return (
    <section className="review-study">
      <p className="eyebrow">YOUR CONTRIBUTIONS</p>
      <h1>
        Little discoveries.
        <br />A growing map.
      </h1>
      <p className="sample-note">Illustrative records, not actual community submissions.</p>
      <div className="review-ledger">
        {reviewExamples.map((item, index) => (
          <article key={item.status}>
            <span className="review-step">0{index + 1}</span>
            {props.variant === 2 && <Photo place={places[index % places.length]} />}
            <div>
              <p className="review-status">
                <Icon name={item.icon} size={20} />
                {item.status}
              </p>
              <h3>{item.name}</h3>
              <p>{item.note}</p>
              <Button variant="secondary" onClick={() => setSelectedStatus(item.status)}>
                {item.action}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {selectedStatus && (
        <StatusMessage kind="information" title={`${selectedStatus} · preview`}>
          No submission is edited. Approval and current-condition verification remain different
          states.
        </StatusMessage>
      )}
    </section>
  );
}
