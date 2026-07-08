import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Menu,
  MessageCircle,
  MoonStar,
  Phone,
  Route,
  Sparkles,
  Telescope,
  Users,
  X,
} from "lucide-react";

const links = {
  talk: "https://talk.naver.com/profile/c/astrocamp10",
  regular: "https://cafe.naver.com/astrocamp10/279",
  intro: "https://cafe.naver.com/astrocamp10/6632",
  instagram: "https://www.instagram.com/astrocamp_incheon/",
  day: "http://astrocamp.net/sub04/01.php",
  place: "https://m.place.naver.com/place/1622594725/home",
  tel: "tel:032-567-3245",
};

const navItems = [
  ["regular", "정규반 소개"],
  ["flow", "수업 흐름"],
  ["roadmap", "과정 로드맵"],
  ["day-program", "일일프로그램"],
  ["location", "오시는 길"],
];

const flow = [
  {
    icon: BookOpen,
    label: "우주과학 강의",
    time: "개념을 먼저 잡는 시간",
    text: "별자리, 달, 행성, 우주탐사 이야기를 아이 눈높이에 맞춰 이해합니다.",
  },
  {
    icon: GraduationCap,
    label: "탐구 활동",
    time: "질문을 손으로 확인",
    text: "교구, 실험, 기록 활동으로 배운 내용을 아이 스스로 연결합니다.",
  },
  {
    icon: Telescope,
    label: "천체 관측",
    time: "밤하늘에서 확인",
    text: "망원경으로 오늘 배운 천체를 관측하며 책 속 우주를 실제 경험으로 바꿉니다.",
  },
  {
    icon: Sparkles,
    label: "관측 기록",
    time: "생각을 남기는 마무리",
    text: "본 것과 궁금한 것을 기록하며 다음 질문으로 이어지는 수업 흐름을 만듭니다.",
  },
];

const roadmap = [
  ["첫걸음 과정", "초등 저학년 시작", "밤하늘에 익숙해지고 질문하는 습관을 만듭니다."],
  ["체험 과정", "관측과 활동 확장", "별자리와 천체 관측을 놀이가 아닌 탐구로 경험합니다."],
  ["탐구 과정", "개념과 기록 심화", "천문 현상을 이해하고 스스로 설명하는 힘을 기릅니다."],
  ["테마/심화 과정", "관심사별 확장", "우주과학, 관측, 프로젝트 활동으로 깊이를 더합니다."],
];

const faqs = [
  {
    q: "정규반은 어떤 아이에게 잘 맞나요?",
    a: "별, 우주, 과학을 좋아하거나 질문이 많은 초등학생에게 잘 맞습니다. 처음 시작하는 아이도 관측과 활동을 함께 하며 자연스럽게 적응할 수 있습니다.",
  },
  {
    q: "친구들과 팀으로 시작할 수 있나요?",
    a: "가능합니다. 친구, 형제, 또래 그룹으로 상담 후 가능한 시간과 반 구성 방식을 안내받을 수 있습니다.",
  },
  {
    q: "일일프로그램과 정규반은 어떻게 다른가요?",
    a: "일일프로그램은 천문대를 먼저 경험해보는 하루 체험에 가깝고, 정규반은 1년 동안 관찰, 탐구, 기록을 이어가는 정기 수업입니다.",
  },
  {
    q: "수강료와 가능 시간은 어디서 확인하나요?",
    a: "반 구성과 시간표에 따라 안내가 필요하므로 전화 또는 네이버톡으로 상담하시면 아이 연령과 희망 요일에 맞춰 안내드립니다.",
  },
];

function IconLabel({ icon: Icon, children }) {
  return (
    <span className="icon-label">
      <Icon aria-hidden="true" size={18} />
      {children}
    </span>
  );
}

function CtaButton({ href, icon: Icon, children, variant = "primary" }) {
  return (
    <a className={`btn ${variant}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      <Icon aria-hidden="true" size={19} />
      <span>{children}</span>
    </a>
  );
}

export function App() {
  const [theme, setTheme] = useState("cinema");
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("regular");
  const [scrollProgress, setScrollProgress] = useState(0);

  const themeName = useMemo(() => (theme === "cinema" ? "밤하늘 시네마형" : "프리미엄 브로슈어형"), [theme]);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.scrollY || 0;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      setIsScrolled(scrollY > 48);
      setScrollProgress(Math.min(1, Math.max(0, scrollY / maxScroll)));

      let current = "regular";
      for (const [id] of navItems) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.offsetTop - 130 <= scrollY) current = id;
      }
      setActiveSection(current);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <main className={`page theme-${theme} ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="인천어린이천문대 홈">
          <span className="brand-mark">
            <MoonStar size={25} aria-hidden="true" />
          </span>
          <span>
            <strong>인천어린이천문대</strong>
            <small>정규반 안내</small>
          </span>
        </a>

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="주요 메뉴">
          {navItems.map(([id, label]) => (
            <a
              className={activeSection === id ? "active" : ""}
              href={`#${id}`}
              key={id}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="theme-switch" aria-label="디자인 시안 선택">
            <button className={theme === "cinema" ? "active" : ""} onClick={() => setTheme("cinema")}>시네마형</button>
            <button className={theme === "brochure" ? "active" : ""} onClick={() => setTheme("brochure")}>브로슈어형</button>
          </div>
          <a className="header-phone" href={links.tel}>
            <Phone size={17} aria-hidden="true" />
            032-567-3245
          </a>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="메뉴 열기">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="eyebrow">
            <Telescope size={18} aria-hidden="true" />
            인천어린이천문대 정규반
          </div>
          <h1>
            밤하늘을 보는 눈을 키우는
            <span>인천어린이천문대 정규반</span>
          </h1>
          <p className="hero-copy">
            한 번 보고 끝나는 체험이 아니라, 관찰·탐구·기록을 통해 아이가 스스로
            질문하고 생각하는 힘을 기르는 정기 수업입니다.
          </p>
          <div className="hero-actions" aria-label="정규반 상담 바로가기">
            <CtaButton href={links.talk} icon={MessageCircle}>정규반 네이버톡 상담</CtaButton>
            <CtaButton href={links.tel} icon={Phone} variant="secondary">전화 상담 032-567-3245</CtaButton>
          </div>
          <div className="hero-facts">
            <IconLabel icon={Users}>친구와 함께 팀 구성 상담</IconLabel>
            <IconLabel icon={Clock}>가능 시간과 수강료 개별 안내</IconLabel>
            <IconLabel icon={MapPin}>인천 서구 왕길동 2층</IconLabel>
          </div>
        </div>
      </section>

      <aside className="floating-contact" aria-label="빠른 상담">
        <span>{themeName}</span>
        <strong>정규반 상담</strong>
        <CtaButton href={links.talk} icon={MessageCircle}>네이버톡 문의</CtaButton>
        <CtaButton href={links.tel} icon={Phone} variant="secondary">전화하기</CtaButton>
      </aside>

      <section className="section regular-section" id="regular">
        <div className="section-heading">
          <span className="kicker">Regular Class</span>
          <h2>정규반은 아이가 우주를 꾸준히 탐구하는 과정입니다.</h2>
          <p>
            단발성 체험보다 중요한 것은 반복해서 질문하고, 관측하고, 자신의 언어로 기록하는 경험입니다.
            인천어린이천문대 정규반은 그 흐름을 아이의 성장 속도에 맞춰 이어갑니다.
          </p>
        </div>
        <div className="regular-grid">
          <article className="feature-panel">
            <img src="/assets/regular-class.png" alt="아이들이 망원경을 중심으로 천문 수업을 듣는 모습" />
            <div>
              <span className="panel-label">정규교실 안내</span>
              <h3>관찰, 탐구, 기록이 이어지는 팀 수업</h3>
              <p>
                또래 친구들과 같은 시간에 모여 배우기 때문에 질문이 자연스럽고,
                담임 선생님과 함께 수업 흐름을 꾸준히 쌓아갈 수 있습니다.
              </p>
              <a className="text-link" href={links.regular} target="_blank" rel="noreferrer">
                정규교실 안내 보기 <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </article>

          <div className="reason-list" aria-label="정규반 핵심 포인트">
            <div>
              <strong>수업 전</strong>
              <p>오늘의 천체와 질문을 먼저 열어 아이의 호기심을 깨웁니다.</p>
            </div>
            <div>
              <strong>수업 중</strong>
              <p>강의와 활동으로 개념을 이해하고, 망원경 관측으로 직접 확인합니다.</p>
            </div>
            <div>
              <strong>수업 후</strong>
              <p>관측 기록과 대화로 배운 내용을 생각의 언어로 남깁니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section flow-section" id="flow">
        <div className="section-heading compact">
          <span className="kicker">Class Flow</span>
          <h2>한 번의 수업도 흐름 있게 설계합니다.</h2>
        </div>
        <div className="flow-grid">
          {flow.map((item) => {
            const Icon = item.icon;
            return (
              <article className="flow-card" key={item.label}>
                <span className="flow-icon"><Icon size={24} aria-hidden="true" /></span>
                <small>{item.time}</small>
                <h3>{item.label}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section roadmap-section" id="roadmap">
        <div className="section-heading">
          <span className="kicker">Roadmap</span>
          <h2>아이의 학년과 관심에 맞춰 깊이를 넓힙니다.</h2>
          <p>정확한 반 배정과 가능 시간은 상담으로 확인하고, 아이가 오래 몰입할 수 있는 흐름을 함께 잡습니다.</p>
        </div>
        <div className="roadmap">
          {roadmap.map(([title, meta, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <small>{meta}</small>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section day-section" id="day-program">
        <div className="day-card">
          <img src="/assets/day-program.png" alt="천문대 일일프로그램에서 가족과 아이들이 망원경을 체험하는 모습" />
          <div>
            <span className="kicker">One-Day Program</span>
            <h2>처음이라면 일일프로그램으로 먼저 만나보세요.</h2>
            <p>
              정규반이 장기적인 우주 탐구 과정이라면, 일일프로그램은 천문대 분위기와 관측 체험을
              부담 없이 경험해보는 입구입니다.
            </p>
            <div className="day-actions">
              <CtaButton href={links.day} icon={CalendarDays}>일일 프로그램 예약</CtaButton>
              <CtaButton href={links.intro} icon={ExternalLink} variant="ghost">천문대 소개 보기</CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="section process-section">
        <div className="section-heading compact">
          <span className="kicker">Start Process</span>
          <h2>정규반 상담은 이렇게 진행됩니다.</h2>
        </div>
        <div className="process-grid">
          <article>
            <span>01</span>
            <h3>아이 연령과 관심사 확인</h3>
            <p>처음 시작인지, 친구와 함께인지, 희망 요일이 있는지 상담합니다.</p>
          </article>
          <article>
            <span>02</span>
            <h3>가능 시간과 반 구성 안내</h3>
            <p>현재 가능한 시간, 팀 구성 방식, 수강료 안내를 함께 확인합니다.</p>
          </article>
          <article>
            <span>03</span>
            <h3>정규반 또는 일일 체험 선택</h3>
            <p>바로 정규반으로 시작하거나, 일일프로그램으로 먼저 경험할 수 있습니다.</p>
          </article>
        </div>
      </section>

      <section className="section faq-location" id="location">
        <div className="faq-block">
          <span className="kicker">FAQ</span>
          <h2>상담 전 많이 묻는 질문</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className={`faq-item ${openFaq === index ? "open" : ""}`} key={faq.q}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={19} aria-hidden="true" />
                </button>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="location-card">
          <span className="kicker">Location</span>
          <h2>오시는 길</h2>
          <p className="address">인천광역시 서구 원당대로 454-14 (왕길동) 2층</p>
          <div className="map-preview" aria-label="인천어린이천문대 위치 미리보기">
            <MapPin size={34} aria-hidden="true" />
            <span>인천어린이천문대</span>
          </div>
          <div className="location-actions">
            <CtaButton href={links.place} icon={Route}>스마트플레이스 보기</CtaButton>
            <CtaButton href={links.talk} icon={MessageCircle} variant="secondary">방문 전 문의</CtaButton>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>인천어린이천문대</strong>
          <p>상담 후 아이 연령과 관심사에 맞는 수업을 안내해드립니다.</p>
        </div>
        <div className="footer-links">
          <a href={links.instagram} target="_blank" rel="noreferrer">인스타그램</a>
          <a href={links.place} target="_blank" rel="noreferrer">스마트플레이스</a>
          <a href={links.tel}>032-567-3245</a>
        </div>
      </footer>

      <nav className="mobile-cta" aria-label="모바일 빠른 상담">
        <a href={links.tel}><Phone size={18} aria-hidden="true" />전화</a>
        <a href={links.talk} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" />네이버톡</a>
        <a href={links.day} target="_blank" rel="noreferrer"><CalendarDays size={18} aria-hidden="true" />일일예약</a>
      </nav>
    </main>
  );
}
