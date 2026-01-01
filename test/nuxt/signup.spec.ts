import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Signup from "~/pages/signup/index.vue";

// Mock $fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

// Mock useAuth composable
const mockSignIn = vi.fn();
mockNuxtImport("useAuth", () => {
  return () => ({
    signIn: mockSignIn,
    status: { value: "unauthenticated" },
    data: { value: null },
  });
});

describe("Signup Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the signup form with all elements", async () => {
    const wrapper = await mountSuspended(Signup, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          LoadingSpinner: {
            template: '<div class="loading-spinner"></div>',
          },
        },
      },
    });

    // Check for logo
    expect(wrapper.text()).toContain("Flash");
    expect(wrapper.text()).toContain("lang");

    // Check for header
    expect(wrapper.text()).toContain("Create Your Account");
    expect(wrapper.text()).toContain(
      "Start your language learning journey today"
    );

    // Check for Google sign up button
    expect(wrapper.text()).toContain("Sign up with Google");

    // Check for form fields
    expect(wrapper.find("#firstName").exists()).toBe(true);
    expect(wrapper.find("#lastName").exists()).toBe(true);
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#dateOfBirth").exists()).toBe(true);
    expect(wrapper.find("#password1").exists()).toBe(true);
    expect(wrapper.find("#password2").exists()).toBe(true);

    // Check for terms checkbox
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("I agree to the");
    expect(wrapper.text()).toContain("Terms of Service");
    expect(wrapper.text()).toContain("Privacy Policy");

    // Check for submit button
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Create Account");

    // Check for login link
    expect(wrapper.text()).toContain("Already have an account?");
    expect(wrapper.text()).toContain("Sign in");
  });

  it("binds all form inputs to v-model correctly", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    expect((wrapper.find("#firstName").element as HTMLInputElement).value).toBe(
      "John"
    );
    expect((wrapper.find("#lastName").element as HTMLInputElement).value).toBe(
      "Doe"
    );
    expect((wrapper.find("#email").element as HTMLInputElement).value).toBe(
      "john@example.com"
    );
    expect(
      (wrapper.find("#dateOfBirth").element as HTMLInputElement).value
    ).toBe("2000-01-01");
    expect((wrapper.find("#password1").element as HTMLInputElement).value).toBe(
      "Password123!"
    );
    expect((wrapper.find("#password2").element as HTMLInputElement).value).toBe(
      "Password123!"
    );
  });

  it("binds terms checkbox to v-model correctly", async () => {
    const wrapper = await mountSuspended(Signup);

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it("successfully submits form with valid data", async () => {
    mockFetch.mockResolvedValue({});
    mockSignIn.mockResolvedValue({ error: null });

    const wrapper = await mountSuspended(Signup, {
      global: {
        stubs: {
          LoadingSpinner: {
            template: '<div class="loading-spinner"></div>',
          },
        },
      },
    });

    // Fill in the form with valid data
    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");
    await wrapper.find('input[type="checkbox"]').setValue(true);

    // Submit the form
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Verify $fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith("/api/signup", {
      method: "POST",
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        dateOfBirth: "2000-01-01",
        password1: "Password123!",
        password2: "Password123!",
      },
    });

    // Verify signIn was called after successful signup
    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "john@example.com",
      password: "Password123!",
      redirect: true,
      callbackUrl: "/user/dashboard",
    });
  });

  it("displays validation error for invalid email", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("invalid-email");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Invalid email address");
  });

  it("displays validation error for password mismatch", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("DifferentPassword123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Passwords do not match");
  });

  it("displays validation error for weak password", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("weak");
    await wrapper.find("#password2").setValue("weak");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Password must be at least 8 characters long"
    );
  });

  it("displays validation error for password without uppercase letter", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("password123!");
    await wrapper.find("#password2").setValue("password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  it("displays validation error for password without lowercase letter", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("PASSWORD123!");
    await wrapper.find("#password2").setValue("PASSWORD123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  it("displays validation error for password without number", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password!");
    await wrapper.find("#password2").setValue("Password!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Password must contain at least one number"
    );
  });

  it("displays validation error for password without special character", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123");
    await wrapper.find("#password2").setValue("Password123");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Password must contain at least one special character"
    );
  });

  it("displays validation error for underage user", async () => {
    const wrapper = await mountSuspended(Signup);

    // Calculate a date that makes user 12 years old
    const today = new Date();
    const birthDate = new Date(
      today.getFullYear() - 12,
      today.getMonth(),
      today.getDate()
    );
    const dateString = birthDate.toISOString().split("T")[0];

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue(dateString);
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "You must be at least 13 years old to sign up"
    );
  });

  it("displays API error when signup fails", async () => {
    mockFetch.mockRejectedValue(new Error("API Error"));

    const wrapper = await mountSuspended(Signup, {
      global: {
        stubs: {
          LoadingSpinner: {
            template: '<div class="loading-spinner"></div>',
          },
        },
      },
    });

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Signup failed. Please try again");
  });

  it("shows loading spinner when form is submitting", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const wrapper = await mountSuspended(Signup, {
      global: {
        stubs: {
          LoadingSpinner: {
            template: '<div class="loading-spinner"></div>',
          },
        },
      },
    });

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".loading-spinner").exists()).toBe(true);
  });

  it("disables submit button when form is submitting", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const wrapper = await mountSuspended(Signup, {
      global: {
        stubs: {
          LoadingSpinner: {
            template: '<div class="loading-spinner"></div>',
          },
        },
      },
    });

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    const submitButton = wrapper.find('button[type="submit"]');

    expect(submitButton.attributes("disabled")).toBeUndefined();

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(submitButton.attributes("disabled")).toBeDefined();
  });

  it("clears validation errors when form is resubmitted", async () => {
    const wrapper = await mountSuspended(Signup);

    // First submission with invalid data
    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("invalid-email");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Invalid email address");

    // Second submission with valid email
    mockFetch.mockResolvedValue({});
    mockSignIn.mockResolvedValue({ error: null });

    await wrapper.find("#email").setValue("valid@example.com");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Invalid email address");
  });

  it("has required attribute on all input fields", async () => {
    const wrapper = await mountSuspended(Signup);

    expect(wrapper.find("#firstName").attributes("required")).toBeDefined();
    expect(wrapper.find("#lastName").attributes("required")).toBeDefined();
    expect(wrapper.find("#email").attributes("required")).toBeDefined();
    expect(wrapper.find("#dateOfBirth").attributes("required")).toBeDefined();
    expect(wrapper.find("#password1").attributes("required")).toBeDefined();
    expect(wrapper.find("#password2").attributes("required")).toBeDefined();
    expect(
      wrapper.find('input[type="checkbox"]').attributes("required")
    ).toBeDefined();
  });

  it("has correct input types and placeholders", async () => {
    const wrapper = await mountSuspended(Signup);

    expect(wrapper.find("#firstName").attributes("type")).toBe("text");
    expect(wrapper.find("#firstName").attributes("placeholder")).toBe("John");

    expect(wrapper.find("#lastName").attributes("type")).toBe("text");
    expect(wrapper.find("#lastName").attributes("placeholder")).toBe("Doe");

    expect(wrapper.find("#email").attributes("type")).toBe("email");
    expect(wrapper.find("#email").attributes("placeholder")).toBe(
      "your@email.com"
    );

    expect(wrapper.find("#dateOfBirth").attributes("type")).toBe("date");

    expect(wrapper.find("#password1").attributes("type")).toBe("password");
    expect(wrapper.find("#password1").attributes("placeholder")).toBe(
      "••••••••"
    );

    expect(wrapper.find("#password2").attributes("type")).toBe("password");
    expect(wrapper.find("#password2").attributes("placeholder")).toBe(
      "••••••••"
    );
  });

  it("renders with proper styling classes", async () => {
    const wrapper = await mountSuspended(Signup);

    expect(wrapper.html()).toContain("bg-gradient-to-br");
    expect(wrapper.html()).toContain("backdrop-blur-xl");
    expect(wrapper.html()).toContain("rounded-3xl");
    expect(wrapper.html()).toContain("bg-gradient-to-r");
  });

  it("renders NuxtLink to login page", async () => {
    const wrapper = await mountSuspended(Signup);

    const loginLink = wrapper.findComponent({ name: "NuxtLink" });
    expect(loginLink.exists()).toBe(true);
    expect(loginLink.props("to")).toBe("/login");
  });

  it("does not display errors initially", async () => {
    const wrapper = await mountSuspended(Signup);

    expect(wrapper.find(".text-red-400").exists()).toBe(false);
  });

  it("renders Google sign up button with SVG icon", async () => {
    const wrapper = await mountSuspended(Signup);

    const googleButton = wrapper.find('button[type="button"]');
    expect(googleButton.exists()).toBe(true);
    expect(googleButton.text()).toContain("Sign up with Google");
    expect(googleButton.find("svg").exists()).toBe(true);
  });

  it("renders divider with 'or' text", async () => {
    const wrapper = await mountSuspended(Signup);

    expect(wrapper.text()).toContain("or");
    expect(wrapper.html()).toContain("border-t");
  });

  it("displays validation error for missing first name", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("  ");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("First name is required");
  });

  it("displays validation error for missing last name", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("  ");
    await wrapper.find("#email").setValue("john@example.com");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Last name is required");
  });

  it("does not call API when validation fails", async () => {
    const wrapper = await mountSuspended(Signup);

    await wrapper.find("#firstName").setValue("John");
    await wrapper.find("#lastName").setValue("Doe");
    await wrapper.find("#email").setValue("invalid-email");
    await wrapper.find("#dateOfBirth").setValue("2000-01-01");
    await wrapper.find("#password1").setValue("Password123!");
    await wrapper.find("#password2").setValue("Password123!");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
