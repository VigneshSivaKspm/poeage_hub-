import { z } from 'zod';

// ===== AUTH =====

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must not exceed 60 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
      .optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ===== ADDRESS =====

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  recipientName: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  line1: z.string().min(5, 'Address too short').max(200),
  line2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ===== PRODUCT =====

export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  shortDescription: z.string().max(300).optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  brandId: z.string().optional(),
  basePrice: z
    .number({ invalid_type_error: 'Price must be a number' })
    .int('Price must be in paise (integer)')
    .min(100, 'Minimum price is ₹1'), // paise
  salePrice: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
  costPrice: z.number().int().min(0).optional().nullable(),
  tags: z.array(z.string()).max(20).default([]),
  gstRate: z.number().min(0).max(1).default(0.18),
  hsn: z.string().max(10).optional(),
  returnPolicy: z.string().max(500).optional(),
  warranty: z.string().max(200).optional(),
  dimensions: z
    .object({
      lengthCm: z.number().positive(),
      widthCm: z.number().positive(),
      heightCm: z.number().positive(),
      weightGrams: z.number().positive(),
    })
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

// ===== COUPON =====

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric'),
    description: z.string().min(5).max(200),
    discountType: z.enum(['percentage', 'flat']),
    discountValue: z.number().positive(),
    maxDiscountAmount: z.number().int().positive().optional(),
    minOrderAmount: z.number().int().min(0).default(0),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().default(1),
    isActive: z.boolean().default(true),
    validFrom: z.date(),
    validUntil: z.date(),
    applicableVendorIds: z.array(z.string()).default([]),
    applicableCategoryIds: z.array(z.string()).default([]),
  })
  .refine((data) => data.validUntil > data.validFrom, {
    message: 'Valid until must be after valid from',
    path: ['validUntil'],
  })
  .refine(
    (data) => {
      if (data.discountType === 'percentage') {
        return data.discountValue > 0 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Percentage discount must be between 0 and 100',
      path: ['discountValue'],
    },
  );

export type CouponInput = z.infer<typeof couponSchema>;

// ===== VENDOR APPLICATION =====

export const vendorApplicationSchema = z.object({
  storeName: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  businessType: z.enum(['individual', 'proprietorship', 'partnership', 'pvt_ltd', 'ltd']),
  gstNumber: z
    .string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST number')
    .optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number')
    .optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the vendor agreement' }),
  }),
});

export type VendorApplicationInput = z.infer<typeof vendorApplicationSchema>;

// ===== DRIVER APPLICATION =====

export const driverApplicationSchema = z.object({
  displayName: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email(),
  vehicleType: z.enum(['bicycle', 'motorcycle', 'scooter', 'car', 'van']),
  vehicleNumber: z.string().min(4).max(15),
  licenseNumber: z.string().min(5).max(20),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the driver agreement' }),
  }),
});

export type DriverApplicationInput = z.infer<typeof driverApplicationSchema>;

// ===== REVIEW =====

export const reviewSchema = z.object({
  rating: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ===== SUPPORT TICKET =====

export const supportTicketSchema = z.object({
  category: z.enum(['order', 'payment', 'delivery', 'product', 'account', 'vendor', 'other']),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(2000),
  orderId: z.string().optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
