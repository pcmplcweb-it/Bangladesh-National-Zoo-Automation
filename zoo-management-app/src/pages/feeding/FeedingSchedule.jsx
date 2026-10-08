import { PageHead, Card, Badge } from '../../components/ui';
import { FEEDING_SCHEDULE } from '../../data/master';
import { employeeById } from '../../services/hr';
import { DAY_NAMES } from '../../lib/dates';

const order = [6, 0, 1, 2, 3, 4, 5]; // Sat → Fri

export default function FeedingSchedule() {
  const byAnimal = {};
  for (const s of FEEDING_SCHEDULE) (byAnimal[s.animal] ||= []).push(s);
  return (
    <>
      <PageHead title="Meal schedule" sub="Fixed daily feeding plan per animal. In production the curator edits this from the backend admin." />
      <Card>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Animal</th><th>Enclosure</th><th>Food</th><th className="num">Qty</th><th>Keeper</th><th>Days</th></tr></thead>
            <tbody>
              {FEEDING_SCHEDULE.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.time}</b></td>
                  <td className="nowrap">{s.emoji} {s.animal}</td>
                  <td>{s.enclosure}</td>
                  <td>{s.food}</td>
                  <td className="num nowrap">{s.qty}</td>
                  <td className="nowrap">{employeeById(s.keeperId)?.name}</td>
                  <td>{s.days.length === 7 ? <Badge tone="good">Every day</Badge> : <span className="small">{order.filter((d) => s.days.includes(d)).map((d) => DAY_NAMES[d]).join(', ')}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid g3" style={{ marginTop: 16 }}>
        {Object.entries(byAnimal).map(([animal, slots]) => (
          <Card key={animal} title={`${slots[0].emoji} ${animal}`} sub={`${slots.length} meal(s) a day · ${slots[0].enclosure}`}>
            {slots.map((s) => (
              <div key={s.id} className="spread small" style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>
                <span><b>{s.time}</b> · {s.food}</span><span className="muted">{s.qty}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
