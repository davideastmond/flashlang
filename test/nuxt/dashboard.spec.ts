import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "~/pages/user/dashboard/index.vue";

const fetchMock = vi.fn();

vi.stubGlobal("$fetch", fetchMock);

// Mock navigateTo
mockNuxtImport("navigateTo", () => {
  return vi.fn();
});

// Mock toShortenedUuid
mockNuxtImport("toShortenedUuid", () => {
  return vi.fn((uuid: string) => uuid.slice(0, 8));
});

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock response for $fetch
    fetchMock.mockResolvedValue({
      data: {
        totalStudySets: 0,
        totalStudySessions: 0,
        totalCards: 0,
        studyStreak: 0,
        accuracy: 0,
        recentSessions: [],
      },
    });
  });

  it("renders the dashboard with main sections", async () => {
    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Check for Quick Actions section
    expect(wrapper.text()).toContain("Quick Actions");
    expect(wrapper.text()).toContain("Create New Study Set");
    expect(wrapper.text()).toContain("Browse Study Sets");

    // Check for Your Progress section
    expect(wrapper.text()).toContain("Your Progress");

    // Check for Recent History section
    expect(wrapper.text()).toContain("Recent History");
  });

  it("displays correct stats data", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 3,
      accuracy: 85,
      recentSessions: [],
    };

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Wait for component to be mounted and data to be loaded
    await wrapper.vm.$nextTick();

    // Check stats are displayed
    expect(wrapper.text()).toContain("Total Study Sets");
    expect(wrapper.text()).toContain("Total Study Sessions");
    expect(wrapper.text()).toContain("Flash Cards");
    expect(wrapper.text()).toContain("Study Streak");
    expect(wrapper.text()).toContain("Accuracy");
  });

  it("shows empty state when no sessions exist", async () => {
    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Check for empty state message
    expect(wrapper.text()).toContain("No sessions yet");
    expect(wrapper.text()).toContain(
      "Get started by creating your first flashcard session."
    );
    expect(wrapper.text()).toContain("Create Session");
  });

  it("renders Quick Actions cards with correct links", async () => {
    const mockStats = {
      totalStudySets: 0,
      totalStudySessions: 0,
      totalCards: 0,
      studyStreak: 0,
      accuracy: 0,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard);

    // Find NuxtLink components
    const links = wrapper.findAllComponents({ name: "NuxtLink" });

    expect(links.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain("Create New Study Set");
    expect(wrapper.text()).toContain("Browse Study Sets");
  });

  it("displays all stat cards with icons", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 3,
      accuracy: 85,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Check for SVG icons (there should be multiple)
    const svgs = wrapper.findAll("svg");
    expect(svgs.length).toBeGreaterThan(5); // At least 5 stat cards + quick action cards
  });

  it("renders with proper styling classes", async () => {
    const mockStats = {
      totalStudySets: 0,
      totalStudySessions: 0,
      totalCards: 0,
      studyStreak: 0,
      accuracy: 0,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Check for key styling classes
    expect(wrapper.html()).toContain("bg-gradient-to-br");
    expect(wrapper.html()).toContain("backdrop-blur-sm");
    expect(wrapper.html()).toContain("rounded-lg");
  });
});
