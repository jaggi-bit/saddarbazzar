package com.sadarbazar.config;

import com.sadarbazar.entity.Category;
import com.sadarbazar.entity.Product;
import com.sadarbazar.entity.Promotion;
import com.sadarbazar.entity.User;
import com.sadarbazar.entity.enums.DiscountType;
import com.sadarbazar.entity.enums.Role;
import com.sadarbazar.repository.CategoryRepository;
import com.sadarbazar.repository.ProductRepository;
import com.sadarbazar.repository.PromotionRepository;
import com.sadarbazar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Data already seeded, skipping...");
            return;
        }

        log.info("Seeding database with sample data...");

        // --- Admin User ---
        User admin = userRepository.save(User.builder()
                .email("admin@sadarbazar.pk")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .fullName("Admin User")
                .build());

        // --- RBAC: Additional admin roles for testing ---
        userRepository.save(User.builder()
                .email("superadmin@sadarbazar.pk")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.SUPER_ADMIN)
                .fullName("Super Admin")
                .build());

        userRepository.save(User.builder()
                .email("manager@sadarbazar.pk")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.MANAGER)
                .fullName("Manager User")
                .build());

        userRepository.save(User.builder()
                .email("editor@sadarbazar.pk")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.CONTENT_EDITOR)
                .fullName("Content Editor")
                .build());

        // --- Categories ---
        Category electronics = categoryRepository.save(Category.builder()
                .name("Electronics").slug("electronics")
                .description("Latest gadgets and electronic devices").build());

        Category clothing = categoryRepository.save(Category.builder()
                .name("Clothing").slug("clothing")
                .description("Trendy fashion for men and women").build());

        Category home = categoryRepository.save(Category.builder()
                .name("Home & Kitchen").slug("home-kitchen")
                .description("Everything for your home").build());

        Category beauty = categoryRepository.save(Category.builder()
                .name("Beauty & Health").slug("beauty-health")
                .description("Personal care and beauty products").build());

        Category sports = categoryRepository.save(Category.builder()
                .name("Sports & Outdoors").slug("sports-outdoors")
                .description("Gear for active lifestyles").build());

        // Sub-categories
        Category phones = categoryRepository.save(Category.builder()
                .name("Mobile Phones").slug("mobile-phones")
                .description("Smartphones and feature phones").parent(electronics).build());

        Category accessories = categoryRepository.save(Category.builder()
                .name("Accessories").slug("accessories")
                .description("Phone cases, chargers, and more").parent(electronics).build());

        Category menClothing = categoryRepository.save(Category.builder()
                .name("Men's Clothing").slug("mens-clothing")
                .parent(clothing).build());

        Category womenClothing = categoryRepository.save(Category.builder()
                .name("Women's Clothing").slug("womens-clothing")
                .parent(clothing).build());

        // --- Products ---
        List<Product> products = List.of(
            Product.builder().sku("ELEC-001").name("Wireless Bluetooth Earbuds Pro")
                .description("Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance. Crystal clear audio with deep bass.")
                .price(new BigDecimal("3499.00")).compareAtPrice(new BigDecimal("4999.00"))
                .stockQuantity(150).category(accessories).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/6C3CE1/white?text=Earbuds").weightGrams(50).build(),

            Product.builder().sku("ELEC-002").name("Smart Watch Series X")
                .description("Advanced health monitoring with heart rate, SpO2, and sleep tracking. 1.9\" AMOLED display with always-on mode.")
                .price(new BigDecimal("8999.00")).compareAtPrice(new BigDecimal("12999.00"))
                .stockQuantity(75).category(accessories).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/8B5CF6/white?text=SmartWatch").weightGrams(45).build(),

            Product.builder().sku("ELEC-003").name("10000mAh Power Bank Ultra Slim")
                .description("Ultra-slim portable charger with 22.5W fast charging. Dual USB-C ports, LED display.")
                .price(new BigDecimal("2299.00"))
                .stockQuantity(200).category(accessories)
                .imageUrl("https://placehold.co/400x400/5B21B6/white?text=PowerBank").weightGrams(200).build(),

            Product.builder().sku("PHONE-001").name("Galaxy S24 Ultra (256GB)")
                .description("Flagship smartphone with 200MP camera, S Pen, 5000mAh battery, and Snapdragon 8 Gen 3 processor.")
                .price(new BigDecimal("249999.00")).compareAtPrice(new BigDecimal("279999.00"))
                .stockQuantity(25).category(phones).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/F59E0B/white?text=Galaxy+S24").weightGrams(232).build(),

            Product.builder().sku("CLOTH-001").name("Premium Cotton T-Shirt")
                .description("100% organic cotton t-shirt with a relaxed fit. Available in multiple colors. Pre-shrunk and fade-resistant.")
                .price(new BigDecimal("1299.00")).compareAtPrice(new BigDecimal("1799.00"))
                .stockQuantity(500).category(menClothing)
                .imageUrl("https://placehold.co/400x400/10B981/white?text=T-Shirt").weightGrams(180).build(),

            Product.builder().sku("CLOTH-002").name("Embroidered Lawn Suit 3-Piece")
                .description("Premium unstitched lawn suit with chiffon dupatta and dyed cambric trouser. Elegant embroidery on front and sleeves.")
                .price(new BigDecimal("4599.00")).compareAtPrice(new BigDecimal("6499.00"))
                .stockQuantity(100).category(womenClothing).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/EC4899/white?text=Lawn+Suit").weightGrams(400).build(),

            Product.builder().sku("HOME-001").name("Stainless Steel Cookware Set (10 Piece)")
                .description("Professional-grade stainless steel pots and pans. Induction compatible, dishwasher safe, with tempered glass lids.")
                .price(new BigDecimal("12999.00")).compareAtPrice(new BigDecimal("18999.00"))
                .stockQuantity(40).category(home)
                .imageUrl("https://placehold.co/400x400/3B82F6/white?text=Cookware").weightGrams(5000).build(),

            Product.builder().sku("HOME-002").name("Memory Foam Pillow Set (2 Pack)")
                .description("Ergonomic contour memory foam pillows with cooling gel layer. Hypoallergenic bamboo cover included.")
                .price(new BigDecimal("3499.00"))
                .stockQuantity(120).category(home)
                .imageUrl("https://placehold.co/400x400/6366F1/white?text=Pillows").weightGrams(1200).build(),

            Product.builder().sku("BEAUTY-001").name("Vitamin C Brightening Serum")
                .description("Concentrated 20% vitamin C serum with hyaluronic acid and vitamin E. Brightens skin, reduces dark spots.")
                .price(new BigDecimal("1899.00")).compareAtPrice(new BigDecimal("2499.00"))
                .stockQuantity(300).category(beauty).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/F97316/white?text=Serum").weightGrams(30).build(),

            Product.builder().sku("SPORT-001").name("Adjustable Dumbbell Set (20kg)")
                .description("Space-saving adjustable dumbbells from 2.5kg to 20kg. Quick-lock mechanism, anti-slip rubber grip.")
                .price(new BigDecimal("7999.00")).compareAtPrice(new BigDecimal("10999.00"))
                .stockQuantity(60).category(sports)
                .imageUrl("https://placehold.co/400x400/EF4444/white?text=Dumbbells").weightGrams(20000).build(),

            Product.builder().sku("SPORT-002").name("Yoga Mat Premium (6mm)")
                .description("Non-slip TPE yoga mat with alignment lines. Eco-friendly, tear-resistant, with carry strap included.")
                .price(new BigDecimal("2499.00"))
                .stockQuantity(180).category(sports)
                .imageUrl("https://placehold.co/400x400/14B8A6/white?text=Yoga+Mat").weightGrams(800).build(),

            Product.builder().sku("ELEC-004").name("Mechanical Gaming Keyboard RGB")
                .description("Hot-swappable mechanical keyboard with per-key RGB lighting. Cherry MX compatible switches, PBT keycaps.")
                .price(new BigDecimal("5999.00")).compareAtPrice(new BigDecimal("7999.00"))
                .stockQuantity(90).category(electronics).isFeatured(true)
                .imageUrl("https://placehold.co/400x400/A855F7/white?text=Keyboard").weightGrams(850).build()
        );

        productRepository.saveAll(products);

        // --- Promo Codes ---
        promotionRepository.saveAll(List.of(
            Promotion.builder()
                .code("WELCOME10")
                .discountType(DiscountType.PERCENT)
                .value(new BigDecimal("10"))
                .maxDiscountAmount(new BigDecimal("500"))
                .validFrom(Instant.now())
                .validUntil(Instant.now().plus(90, ChronoUnit.DAYS))
                .build(),
            Promotion.builder()
                .code("FLAT500")
                .discountType(DiscountType.FIXED)
                .value(new BigDecimal("500"))
                .minOrderAmount(new BigDecimal("3000"))
                .validFrom(Instant.now())
                .validUntil(Instant.now().plus(30, ChronoUnit.DAYS))
                .build()
        ));

        log.info("✅ Seeded: {} categories, {} products, {} promos, 1 admin user",
                categoryRepository.count(), productRepository.count(), promotionRepository.count());
    }
}
