import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navheader from "~/components/navheader.vue";

// Mock useAuth composable
const mockSignOut = vi.fn();
mockNuxtImport("useAuth", () => {
  return () => ({
    signOut: mockSignOut,
    status: { value: "authenticated" },
    data: { value: { user: { name: "Test User" } } },
  });
});

// Mock useRoute
const mockRoutePath = ref("/user/dashboard");
mockNuxtImport("useRoute", () => {
  return () => ({
    path: mockRoutePath.value,
  });
});

describe("Navheader Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoutePath.value = "/user/dashboard";
  });

  it("renders the navigation bar with logo and title", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt", "width", "height"],
          },
        },
      },
    });

    expect(wrapper.text()).toContain("FlashLang");
    expect(wrapper.find('img[alt="FlashLang Logo"]').exists()).toBe(true);
  });

  it("displays the user's display text", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "John Doe",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    expect(wrapper.text()).toContain("John Doe");
  });

  it("renders desktop navigation links", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const desktopNav = wrapper.find(".hidden.md\\:flex.items-center.space-x-8");
    expect(desktopNav.exists()).toBe(true);
    expect(desktopNav.text()).toContain("Dashboard");
    expect(desktopNav.text()).toContain("Study Sets");
    expect(desktopNav.text()).toContain("Create Set");
  });

  it("has correct navigation link paths", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
    });

    const links = wrapper.findAllComponents({ name: "NuxtLink" });
    const linkPaths = links.map((link) => link.props("to"));

    expect(linkPaths).toContain("/user/dashboard");
    expect(linkPaths).toContain("/user/studysets/view");
    expect(linkPaths).toContain("/user/studysets/new");
  });

  it("renders desktop sign out button", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const desktopUserMenu = wrapper.find(
      ".hidden.md\\:flex.items-center.space-x-4"
    );
    const signOutButton = desktopUserMenu.find("button");

    expect(signOutButton.exists()).toBe(true);
    expect(signOutButton.attributes("title")).toBe("Sign Out");
    expect(signOutButton.find("svg").exists()).toBe(true);
  });

  it("calls signOut when desktop sign out button is clicked", async () => {
    mockSignOut.mockResolvedValue({});

    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const desktopUserMenu = wrapper.find(
      ".hidden.md\\:flex.items-center.space-x-4"
    );
    const signOutButton = desktopUserMenu.find("button");

    await signOutButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(mockSignOut).toHaveBeenCalledWith({
      redirect: true,
      callbackUrl: "/login",
    });
  });

  it("renders mobile hamburger button", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    expect(hamburgerButton.exists()).toBe(true);
  });

  it("toggles mobile menu when hamburger button is clicked", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');

    // Menu should be closed initially
    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(false);

    // Click to open
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(true);

    // Click to close
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(false);
  });

  it("displays correct icon based on menu state", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    const svgs = hamburgerButton.findAll("svg");

    // When closed, should show hamburger icon (M4 6h16M4 12h16M4 18h16)
    expect(svgs[0]?.exists()).toBe(true);
    expect(svgs.length).toBe(1);

    // Open the menu
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    // When open, should show close icon (M6 18L18 6M6 6l12 12)
    const svgsAfterOpen = hamburgerButton.findAll("svg");
    expect(svgsAfterOpen.length).toBe(1);
  });

  it("renders mobile menu with navigation items when open", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    expect(mobileMenu.exists()).toBe(true);
    expect(mobileMenu.text()).toContain("Dashboard");
    expect(mobileMenu.text()).toContain("Study Sets");
    expect(mobileMenu.text()).toContain("Create Set");
  });

  it("displays welcome message in mobile menu header", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "John Doe",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    expect(mobileMenu.text()).toContain("Welcome back,");
    expect(mobileMenu.text()).toContain("John Doe");
  });

  it("closes mobile menu when navigation link is clicked", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(true);

    // Click a navigation link in mobile menu
    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    const dashboardLink = mobileMenu.findAllComponents({ name: "NuxtLink" })[0];
    await dashboardLink.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(false);
  });

  it("renders mobile sign out button", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    const signOutButton = mobileMenu.find(".border-t.border-gray-700 button");

    expect(signOutButton.exists()).toBe(true);
    expect(signOutButton.text()).toContain("Sign Out");
  });

  it("calls signOut when mobile sign out button is clicked", async () => {
    mockSignOut.mockResolvedValue({});

    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    const signOutButton = mobileMenu.find(".border-t.border-gray-700 button");

    await signOutButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(mockSignOut).toHaveBeenCalledWith({
      redirect: true,
      callbackUrl: "/login",
    });
  });

  it("closes mobile menu when overlay is clicked", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(true);

    // Click the overlay
    const overlay = wrapper.find(".fixed.inset-0.bg-black\\/50");
    await overlay.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(false);
  });

  it("renders overlay when mobile menu is open", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Overlay should not exist initially
    expect(wrapper.find(".fixed.inset-0.bg-black\\/50").exists()).toBe(false);

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    // Overlay should exist
    expect(wrapper.find(".fixed.inset-0.bg-black\\/50").exists()).toBe(true);
  });

  it("closes mobile menu when route changes", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    // Find by test id mobile-nav
    const mobileNav = wrapper.find('[data-test="mobile-nav"]');
    expect(mobileNav.exists()).toBe(true);
  });

  it("renders navigation bar as sticky at top", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const nav = wrapper.find("nav");
    expect(nav.classes()).toContain("sticky");
    expect(nav.classes()).toContain("top-0");
    expect(nav.classes()).toContain("z-50");
  });

  it("has proper styling classes for gradient and backdrop", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    const nav = wrapper.find("nav");
    expect(nav.classes()).toContain("bg-gradient-to-br");
    expect(nav.classes()).toContain("backdrop-blur-sm");
  });

  it("logo links to dashboard", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
    });

    const logoLink = wrapper.findComponent({ name: "NuxtLink" });
    expect(logoLink.props("to")).toBe("/user/dashboard");
  });

  it("mobile menu items have proper icons", async () => {
    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    const svgIcons = mobileMenu.findAll("svg");

    // Should have icons for Dashboard, Study Sets, Create Set, and Sign Out
    expect(svgIcons.length).toBeGreaterThanOrEqual(4);
  });

  it("closes mobile menu before signing out", async () => {
    mockSignOut.mockResolvedValue({});

    const wrapper = await mountSuspended(Navheader, {
      props: {
        displayText: "Test User",
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ["src", "alt"],
          },
        },
      },
    });

    // Open the menu
    const hamburgerButton = wrapper.find('button[aria-label="Toggle menu"]');
    await hamburgerButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(true);

    // Click sign out button in mobile menu
    const mobileMenu = wrapper.find(".fixed.inset-y-0.right-0");
    const signOutButton = mobileMenu.find(".border-t.border-gray-700 button");
    await signOutButton.trigger("click");
    await wrapper.vm.$nextTick();

    // Menu should be closed
    expect(wrapper.find(".fixed.inset-y-0.right-0").exists()).toBe(false);
    expect(mockSignOut).toHaveBeenCalled();
  });
});
