import type { ProductContent, Requirement } from "@/lib/catalogue/content-schema";

/*
 * SAMPLE CONTENT FOR DEVELOPMENT ONLY.
 * These six products exist so the catalogue and product page can be built and
 * tested. They are seeded as drafts with is_sample = true. The owner must
 * review or replace every word, price and file before publishing any of them.
 * No reviews, ratings, sales counts or customer results are seeded — ever.
 * File keys under "samples/" point to nothing yet: no real files are uploaded
 * until Phase 2. External links use example.com (a reserved placeholder domain).
 */

export type SeedCategory = {
  slug: string;
  name: string;
  goalGroup: "create" | "learn" | "work_smarter" | "build_make";
  description: string;
  icon: string;
  sortOrder: number;
};

export type SeedFile = {
  label: string;
  deliveryType: "file" | "external_link" | "lesson_resource";
  fileKey?: string;
  externalUrl?: string;
  fileName?: string;
  mimeType?: string;
};

export type SeedProduct = {
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  productType:
    "pdf" | "ebook" | "course" | "markdown" | "notion" | "design_kit" | "prompt_pack" | "model_3d";
  categorySlug: string;
  level: "beginner" | "intermediate" | "advanced";
  /** INR in paise. Omit for free products. Sample prices only — owner sets real ones. */
  priceInr?: number;
  isFree: boolean;
  featured: boolean;
  setupTimeMinutes: number;
  licenseType: "personal" | "commercial" | "team";
  licenseText: string;
  requirements: Requirement[];
  content: ProductContent;
  files: SeedFile[];
};

export const seedCategories: SeedCategory[] = [
  {
    slug: "create",
    name: "Create",
    goalGroup: "create",
    description: "Design something you are proud to share.",
    icon: "palette",
    sortOrder: 1,
  },
  {
    slug: "learn",
    name: "Learn",
    goalGroup: "learn",
    description: "Pick up a new skill, one clear step at a time.",
    icon: "book-open",
    sortOrder: 2,
  },
  {
    slug: "work-smarter",
    name: "Work Smarter",
    goalGroup: "work_smarter",
    description: "Organise your work and save time every week.",
    icon: "calendar-check",
    sortOrder: 3,
  },
  {
    slug: "build-make",
    name: "Build & Make",
    goalGroup: "build_make",
    description: "Make real things you can hold and use.",
    icon: "box",
    sortOrder: 4,
  },
];

const personalLicense =
  "For your own personal use. You may edit it as much as you like. You may not resell, share or give away the files.";

export const seedProducts: SeedProduct[] = [
  {
    slug: "freelance-project-tracker",
    title: "Freelance project tracker",
    tagline: "See every client, deadline and invoice in one calm Notion page.",
    shortDescription:
      "A ready-made Notion workspace for freelancers who juggle several clients and keep losing track of what is due and what has been paid.",
    productType: "notion",
    categorySlug: "work-smarter",
    level: "beginner",
    priceInr: 39900,
    isFree: false,
    featured: true,
    setupTimeMinutes: 15,
    licenseType: "personal",
    licenseText: personalLicense,
    requirements: [
      { name: "A Notion account", cost: "free", note: "The free plan is enough." },
      { name: "A computer or phone with the Notion app or a web browser", cost: "free" },
    ],
    content: {
      benefit: [
        "Freelance work gets messy when clients, deadlines and payments live in different places. This tracker puts them on one page, so you can see what needs doing today and who still owes you money.",
        "You don’t need to know Notion well. The template is already set up — you just add your own clients and projects.",
      ],
      audience: [
        "Freelancers with two or more clients at a time",
        "Students taking on their first paid projects",
        "Side-hustlers who want a simple system, not a big app",
      ],
      notFor: ["Teams that need shared timesheets or payroll"],
      firstWin: {
        title: "Add one real project and see this week’s deadlines",
        description:
          "Duplicate the template, add one client and one project with a due date, and open the “This week” view to see it listed.",
        minutes: 10,
      },
      steps: [
        {
          title: "Duplicate the template",
          body: "Open the link from your library and click Duplicate in the top-right corner of Notion.",
        },
        {
          title: "Add your clients",
          body: "Open the Clients table and replace the two example rows with your real clients.",
        },
        {
          title: "Add your projects",
          body: "In the Projects table, add each project, choose its client and set a due date.",
        },
        {
          title: "Track invoices",
          body: "When you send an invoice, add it to the Invoices table and tick Paid when the money arrives.",
        },
      ],
      results: [
        "A single page that shows every deadline for the week ahead",
        "A clear list of unpaid invoices, so nothing slips through",
      ],
      problems: [
        {
          problem: "I can’t see the Duplicate button.",
          fix: "Make sure you are logged in to Notion. On a phone, tap the three dots at the top, then Duplicate.",
        },
        {
          problem: "The “This week” view is empty.",
          fix: "Check that your projects have a due date within the next seven days.",
        },
      ],
      faq: [
        {
          question: "Do I need a paid Notion plan?",
          answer: "No. The template works on Notion’s free plan.",
        },
        {
          question: "Can I change the columns?",
          answer: "Yes. It is your copy — rename, add or remove anything.",
        },
      ],
      typeDetails: {
        kind: "notion",
        organizes: [
          "Clients and their contact details",
          "Projects and deadlines",
          "Invoices and payments",
        ],
        duplicateSteps: [
          "Open the template link while logged in to Notion",
          "Click Duplicate",
          "Choose the workspace where you want your copy",
        ],
        customization: [
          "Rename the status options to match how you work",
          "Add your own currency to the Invoices table",
        ],
        notionPlan: "Works on the free Notion plan.",
      },
    },
    files: [
      {
        label: "Notion template link",
        deliveryType: "external_link",
        externalUrl: "https://example.com/replace-with-notion-duplicate-link",
      },
      {
        label: "Quick-start guide",
        deliveryType: "file",
        fileKey: "samples/freelance-project-tracker/quick-start.pdf",
        fileName: "quick-start.pdf",
        mimeType: "application/pdf",
      },
    ],
  },
  {
    slug: "clear-email-prompt-pack",
    title: "Clear email prompt pack",
    tagline: "Turn messy notes into polite, clear emails with an AI assistant.",
    shortDescription:
      "Twelve copy-and-paste prompts for writing everyday emails with ChatGPT, Claude or a similar assistant — asking for help, following up, and saying no politely.",
    productType: "prompt_pack",
    categorySlug: "work-smarter",
    level: "beginner",
    isFree: true,
    featured: false,
    setupTimeMinutes: 5,
    licenseType: "personal",
    licenseText: personalLicense,
    requirements: [
      {
        name: "An AI chat assistant such as ChatGPT or Claude",
        cost: "free_or_paid",
        note: "The free versions work for these prompts.",
      },
    ],
    content: {
      benefit: [
        "Writing a clear email can take longer than the task it is about. These prompts give an AI assistant exactly what it needs to draft a good email from your rough notes.",
        "You always read and edit the draft before sending — the prompts help you start, not replace your judgement.",
      ],
      audience: [
        "Anyone who writes work or study emails",
        "People writing in English as a second language",
      ],
      notFor: [],
      firstWin: {
        title: "Write one follow-up email you have been putting off",
        description:
          "Paste the “Gentle follow-up” prompt into your assistant, add two lines about the situation, and edit the draft it gives you.",
        minutes: 5,
      },
      steps: [
        {
          title: "Open the file",
          body: "Open the .md file in any text editor, or read it on the page.",
        },
        {
          title: "Pick a prompt",
          body: "Choose the prompt that matches your situation — each one starts with a short “use this when…” line.",
        },
        {
          title: "Fill in the blanks",
          body: "Copy the prompt into your AI assistant and replace the parts in [square brackets] with your details.",
        },
      ],
      results: [
        "Faster first drafts of routine emails",
        "Emails that are polite and get to the point",
      ],
      problems: [
        {
          problem: "The email sounds too formal.",
          fix: "Add “Make it friendlier and shorter” as a follow-up message in the same chat.",
        },
      ],
      faq: [
        {
          question: "Is anything I paste saved by this store?",
          answer: "No. You paste the prompts into your own AI assistant; nothing comes back to us.",
        },
      ],
      typeDetails: {
        kind: "text_resource",
        samplePreview:
          "Use this when: someone hasn’t replied in a week.\n\n“Write a short, friendly follow-up email to [name] about [topic]. Remind them of [the one thing I need] and suggest [a simple next step]. Keep it under 80 words.”",
        compatibleApps: ["ChatGPT", "Claude", "Any text editor or notes app to read the file"],
        whenToUse: [
          { name: "Gentle follow-up", use: "When someone hasn’t replied" },
          { name: "Saying no politely", use: "When you need to turn down a request" },
          {
            name: "Asking for help",
            use: "When you’re stuck and want to ask a colleague or tutor",
          },
        ],
        fileDetails: "One Markdown (.md) file, UTF-8 text.",
      },
    },
    files: [
      {
        label: "Prompt pack",
        deliveryType: "file",
        fileKey: "samples/clear-email-prompt-pack/clear-email-prompts.md",
        fileName: "clear-email-prompts.md",
        mimeType: "text/markdown",
      },
    ],
  },
  {
    slug: "first-salary-budget-workbook",
    title: "First salary budget workbook",
    tagline: "Plan where your first pay cheque goes before it arrives.",
    shortDescription:
      "A printable workbook that walks you through a simple monthly budget, one page at a time, with worked examples in rupees.",
    productType: "pdf",
    categorySlug: "learn",
    level: "beginner",
    priceInr: 24900,
    isFree: false,
    featured: true,
    setupTimeMinutes: 10,
    licenseType: "personal",
    licenseText: personalLicense,
    requirements: [
      { name: "A PDF reader (built into most phones and computers)", cost: "free" },
      { name: "A printer, if you prefer to write on paper", cost: "paid", note: "Optional." },
    ],
    content: {
      benefit: [
        "Your first salary is exciting — and easy to spend before you notice. This workbook helps you decide in advance how much goes to needs, savings and fun.",
        "It uses plain language and simple maths. No finance background is needed.",
      ],
      audience: ["People starting their first job", "Students with a stipend or part-time income"],
      notFor: ["Anyone looking for investment or tax advice — this workbook does not give it"],
      firstWin: {
        title: "Fill in your one-page money snapshot",
        description: "Write down your expected monthly income and your five biggest regular costs.",
        minutes: 10,
      },
      steps: [
        {
          title: "Print or open the workbook",
          body: "Print it, or fill it in on a tablet with a PDF app.",
        },
        {
          title: "Complete the money snapshot",
          body: "List your income and regular costs on page 3.",
        },
        {
          title: "Choose your split",
          body: "Use the worked example to decide your needs, savings and fun amounts.",
        },
        {
          title: "Track one month",
          body: "Use the tracker pages to note what you actually spend for four weeks.",
        },
      ],
      results: [
        "A written monthly budget you understand",
        "A clear picture of where your money went after one month",
      ],
      problems: [
        {
          problem: "My numbers don’t add up.",
          fix: "Start with the income you are sure of, and leave irregular income out until it arrives.",
        },
      ],
      faq: [
        {
          question: "Is this financial advice?",
          answer:
            "No. It is a planning workbook. For advice about your situation, speak to a qualified adviser.",
        },
      ],
      typeDetails: {
        kind: "reading",
        contents: [
          "Your money snapshot",
          "Needs, savings and fun",
          "A worked example",
          "Four weekly trackers",
          "Looking back on your month",
        ],
        readingLevel: "No finance knowledge needed.",
        extras: ["Printable weekly tracker pages"],
      },
    },
    files: [
      {
        label: "Budget workbook",
        deliveryType: "file",
        fileKey: "samples/first-salary-budget-workbook/budget-workbook.pdf",
        fileName: "budget-workbook.pdf",
        mimeType: "application/pdf",
      },
    ],
  },
  {
    slug: "figma-basics-in-five-lessons",
    title: "Figma basics in five lessons",
    tagline: "Design your first simple poster in Figma, step by step.",
    shortDescription:
      "A short beginner course of five practical lessons. Each lesson ends with something you have made yourself.",
    productType: "course",
    categorySlug: "learn",
    level: "beginner",
    priceInr: 79900,
    isFree: false,
    featured: false,
    setupTimeMinutes: 20,
    licenseType: "personal",
    licenseText: personalLicense,
    requirements: [
      { name: "A Figma account", cost: "free", note: "The free Starter plan is enough." },
      {
        name: "A computer with a web browser",
        cost: "free",
        note: "Figma on a phone is too small for these lessons.",
      },
    ],
    content: {
      benefit: [
        "Figma can look overwhelming the first time you open it. This course shows you only the tools you need to make one simple, good-looking poster.",
        "Each lesson is short and practical, so you learn by doing.",
      ],
      audience: [
        "Complete beginners to design software",
        "Students who need to make posters or slides",
      ],
      notFor: ["Experienced designers looking for advanced techniques"],
      firstWin: {
        title: "Place a headline and a photo on a frame",
        description: "In lesson 1 you create a poster-sized frame and add a title and an image.",
        minutes: 10,
      },
      steps: [
        { title: "Create your Figma account", body: "Sign up for the free plan at figma.com." },
        { title: "Open the course page", body: "Open the course link from your library." },
        {
          title: "Duplicate the practice file",
          body: "Each lesson links to a practice file you can copy.",
        },
        { title: "Follow lesson 1", body: "Watch or read lesson 1 and make your first frame." },
      ],
      results: [
        "A finished simple poster you designed yourself",
        "Confidence with frames, text and images in Figma",
      ],
      problems: [
        {
          problem: "My screen looks different from the lesson.",
          fix: "Figma updates its layout from time to time. Look for the same tool names in the left and right panels.",
        },
      ],
      faq: [
        {
          question: "How is the course delivered?",
          answer: "As a set of lesson pages and practice files you open from your library.",
        },
      ],
      typeDetails: {
        kind: "course",
        outcomes: [
          "Create frames and use a simple grid",
          "Add and style text",
          "Place and crop images",
          "Export a poster",
        ],
        modules: [
          {
            title: "Getting comfortable",
            lessons: [{ title: "Your first frame" }, { title: "Text that is easy to read" }],
          },
          {
            title: "Making the poster",
            lessons: [
              { title: "Images and cropping" },
              { title: "Colour and spacing" },
              { title: "Exporting your poster" },
            ],
          },
        ],
        access:
          "Lesson pages and practice files, opened from your library. No video streaming is included.",
      },
    },
    files: [
      {
        label: "Course lessons",
        deliveryType: "lesson_resource",
        externalUrl: "https://example.com/replace-with-course-lessons",
      },
      {
        label: "Practice files",
        deliveryType: "file",
        fileKey: "samples/figma-basics-in-five-lessons/practice-files.zip",
        fileName: "practice-files.zip",
        mimeType: "application/zip",
      },
    ],
  },
  {
    slug: "small-shop-social-post-kit",
    title: "Small shop social post kit",
    tagline: "Make a week of tidy Instagram posts for your shop in Canva.",
    shortDescription:
      "Editable Canva templates for product posts, announcements and opening hours, designed for small local shops and home businesses.",
    productType: "design_kit",
    categorySlug: "create",
    level: "beginner",
    priceInr: 34900,
    isFree: false,
    featured: true,
    setupTimeMinutes: 10,
    licenseType: "commercial",
    licenseText:
      "You may use your edited designs to promote your own business. You may not resell or share the templates themselves.",
    requirements: [
      { name: "A Canva account", cost: "free", note: "Some optional elements may need Canva Pro." },
    ],
    content: {
      benefit: [
        "Posting regularly is easier when you are not starting from a blank page. This kit gives you post layouts you can fill with your own photos and words.",
      ],
      audience: ["Small shop owners", "Home bakers, crafters and makers who sell online"],
      notFor: [],
      firstWin: {
        title: "Publish one product post",
        description: "Open the product template, swap in your photo and price, and download it.",
        minutes: 10,
      },
      steps: [
        {
          title: "Open the template link",
          body: "Open the Canva link from your library while logged in to Canva.",
        },
        { title: "Make a copy", body: "Click “Use template” to make your own editable copy." },
        { title: "Add your brand", body: "Change the colours and fonts once on the first page." },
        { title: "Fill and download", body: "Add your photos and text, then download as PNG." },
      ],
      results: ["A consistent look across your posts", "A week of posts prepared in one sitting"],
      problems: [
        {
          problem: "Some elements show a crown icon.",
          fix: "Those are Canva Pro elements. Swap them for free elements, or use Canva Pro if you have it.",
        },
      ],
      faq: [],
      typeDetails: {
        kind: "design_kit",
        software: ["Canva (web or app)"],
        formats: ["Canva template link", "Exports as PNG or JPG from Canva"],
        importSteps: ["Open the link", "Click “Use template”", "Edit your copy"],
        components: ["Product post", "New arrival", "Opening hours", "Offer announcement"],
      },
    },
    files: [
      {
        label: "Canva template link",
        deliveryType: "external_link",
        externalUrl: "https://example.com/replace-with-canva-template-link",
      },
    ],
  },
  {
    slug: "desk-cable-organiser",
    title: "Desk cable organiser",
    tagline: "Print a small clip that keeps charging cables on your desk.",
    shortDescription:
      "A simple 3D-printable clip that sits on the edge of a desk and holds up to three cables in place.",
    productType: "model_3d",
    categorySlug: "build-make",
    level: "intermediate",
    isFree: true,
    featured: false,
    setupTimeMinutes: 30,
    licenseType: "personal",
    licenseText:
      "Print as many as you like for yourself. You may not sell the files or the printed clips.",
    requirements: [
      {
        name: "Access to an FDM 3D printer",
        cost: "paid",
        note: "Your own, a friend’s or a local makerspace.",
      },
      { name: "Slicer software such as PrusaSlicer, Cura or Bambu Studio", cost: "free" },
    ],
    content: {
      benefit: [
        "Charging cables that slide off the desk are a small, daily annoyance. This clip holds them in place so they are always within reach.",
      ],
      audience: [
        "People who already have access to a 3D printer",
        "Makerspace members looking for a quick useful print",
      ],
      notFor: ["Anyone without access to a 3D printer"],
      firstWin: {
        title: "Open the model in your slicer",
        description: "Load the STL into your slicer and check it sits flat on the build plate.",
        minutes: 5,
      },
      steps: [
        { title: "Download the files", body: "Download the STL and 3MF files from your library." },
        {
          title: "Open in your slicer",
          body: "Load the file and place it flat on the build plate.",
        },
        {
          title: "Choose your settings",
          body: "Use the settings you normally use for small functional parts.",
        },
        {
          title: "Print and fit",
          body: "Print one clip and test it on your desk edge before printing more.",
        },
      ],
      results: ["A tidier desk with cables that stay put"],
      problems: [
        {
          problem: "The clip is too tight for my desk.",
          fix: "Desk thicknesses vary. Test one print first; a looser fit may need the model scaled slightly in your slicer.",
        },
      ],
      faq: [
        {
          question: "Will it fit my desk?",
          answer: "It is not guaranteed to fit every desk. Print one first to check.",
        },
      ],
      typeDetails: {
        kind: "model_3d",
        formats: ["STL", "3MF"],
        compatibility: ["Any slicer that opens STL or 3MF files"],
        assembly: [],
      },
    },
    files: [
      {
        label: "3D model (STL)",
        deliveryType: "file",
        fileKey: "samples/desk-cable-organiser/cable-clip.stl",
        fileName: "cable-clip.stl",
        mimeType: "model/stl",
      },
      {
        label: "3D model (3MF)",
        deliveryType: "file",
        fileKey: "samples/desk-cable-organiser/cable-clip.3mf",
        fileName: "cable-clip.3mf",
        mimeType: "model/3mf",
      },
    ],
  },
];
