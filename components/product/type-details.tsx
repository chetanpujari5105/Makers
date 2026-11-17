import type { TypeDetails } from "@/lib/catalogue/content-schema";

import { BulletList, Section } from "./product-section";

/*
 * Product-type-specific sections (PROJECT_SPEC §2.4). Each renders only the
 * fields the owner actually supplied — e.g. 3D print settings appear only
 * when tested settings exist, never as guesses.
 */
export function TypeDetailsSection({ details }: { details: TypeDetails }) {
  switch (details.kind) {
    case "notion":
      return (
        <Section id="inside" title="Inside the workspace">
          <BulletList items={details.organizes} />
          <SubHeading>How to copy it into your Notion</SubHeading>
          <NumberedList items={details.duplicateSteps} />
          {details.customization.length > 0 ? (
            <>
              <SubHeading>Make it yours</SubHeading>
              <BulletList items={details.customization} />
            </>
          ) : null}
          <Note>{details.notionPlan}</Note>
        </Section>
      );
    case "text_resource":
      return (
        <Section id="inside" title="Where and when to use it">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
            {details.whenToUse.map((item) => (
              <div key={item.name} className="contents">
                <dt className="font-medium">{item.name}</dt>
                <dd className="text-foreground/85">{item.use}</dd>
              </div>
            ))}
          </dl>
          <SubHeading>Works with</SubHeading>
          <BulletList items={details.compatibleApps} />
          {details.fileDetails ? <Note>{details.fileDetails}</Note> : null}
        </Section>
      );
    case "reading":
      return (
        <Section id="inside" title="What’s inside">
          <NumberedList items={details.contents} />
          {details.extras.length > 0 ? (
            <>
              <SubHeading>Extras</SubHeading>
              <BulletList items={details.extras} />
            </>
          ) : null}
          {details.readingLevel || details.pageCount ? (
            <Note>
              {[details.readingLevel, details.pageCount ? `${details.pageCount} pages.` : null]
                .filter(Boolean)
                .join(" ")}
            </Note>
          ) : null}
        </Section>
      );
    case "course":
      return (
        <Section id="inside" title="What you’ll learn">
          <BulletList items={details.outcomes} />
          <SubHeading>Lessons</SubHeading>
          <ol className="flex flex-col gap-6">
            {details.modules.map((module, index) => (
              <li key={module.title}>
                <p className="font-medium">
                  Part {index + 1}: {module.title}
                </p>
                <ol className="mt-2 flex flex-col border-l border-border pl-5">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.title}
                      className="flex justify-between gap-4 py-1.5 text-foreground/85"
                    >
                      {lesson.title}
                      {lesson.minutes ? (
                        <span className="tabular shrink-0 text-muted-foreground">
                          {lesson.minutes} min
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
          <Note>{details.access}</Note>
        </Section>
      );
    case "design_kit":
      return (
        <Section id="inside" title="What’s in the kit">
          {details.components.length > 0 ? <BulletList items={details.components} /> : null}
          <SubHeading>Software and files</SubHeading>
          <BulletList items={[...details.software, ...details.formats]} />
          <SubHeading>How to open it</SubHeading>
          <NumberedList items={details.importSteps} />
        </Section>
      );
    case "model_3d": {
      const settings = details.printSettings
        ? Object.entries({
            "Layer height": details.printSettings.layerHeight,
            Infill: details.printSettings.infill,
            Supports: details.printSettings.supports,
            Nozzle: details.printSettings.nozzle,
            Material: details.printSettings.material,
          }).filter(([, value]) => value)
        : [];
      return (
        <Section id="inside" title="Files and printing">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <Fact term="File formats">{details.formats.join(", ")}</Fact>
            <Fact term="Works with">{details.compatibility.join(", ")}</Fact>
            {details.dimensions ? <Fact term="Size">{details.dimensions}</Fact> : null}
          </dl>
          {settings.length > 0 ? (
            <>
              <SubHeading>Tested print settings</SubHeading>
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
                {settings.map(([term, value]) => (
                  <Fact key={term} term={term}>
                    {value}
                  </Fact>
                ))}
              </dl>
            </>
          ) : null}
          {details.assembly.length > 0 ? (
            <>
              <SubHeading>Assembly</SubHeading>
              <NumberedList items={details.assembly} />
            </>
          ) : null}
        </Section>
      );
    }
    case "bundle":
      return (
        <Section id="inside" title="What the bundle helps you do">
          <p>{details.combinedOutcome}</p>
        </Section>
      );
  }
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-4 font-sans text-body font-semibold">{children}</h3>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-muted-foreground">{children}</p>;
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-2 pl-6 marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}
