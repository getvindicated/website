import type { FraudPageDict } from "@/lib/i18n/dictionary";

export function RedFlags({ dict }: { dict: FraudPageDict["flags"] }) {
  return (
    <ol className="flag-list">
      {dict.items.map((f, i) => (
        <li key={f.title}>
          <p className="label red">{dict.tag.replace("{n}", String(i + 1))}</p>
          <h3>{f.title}</h3>
          <dl>
            <div>
              <dt>{dict.theySay}</dt>
              <dd>
                <q>{f.dealer}</q>
              </dd>
            </div>
            <div>
              <dt>{dict.means}</dt>
              <dd>
                <p>{f.body}</p>
                <p>{dict.whatToDo.replace("{text}", f.todo)}</p>
              </dd>
            </div>
            <div>
              <dt>{dict.sayBack}</dt>
              <dd>
                <q>{f.you}</q>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
