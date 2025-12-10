using Microsoft.EntityFrameworkCore;
using net_chuvgu.Backend.Models;

namespace net_chuvgu.Backend.Contexts;

public class MarketplaceDbContext : DbContext
    {
        public MarketplaceDbContext(DbContextOptions<MarketplaceDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<AuthorizationData> AuthorizationData { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<UserFavorite> UserFavorites { get; set; }
        public DbSet<News> News { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User - AuthorizationData (один к одному)
            modelBuilder.Entity<User>()
                .HasOne(u => u.AuthorizationData)
                .WithOne(ad => ad.User)
                .HasForeignKey<AuthorizationData>(ad => ad.UserId);

            // User - Order (один ко многим)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            // Order - OrderItem (один ко многим)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId);

            // Product - OrderItem (один ко многим)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId);

            // User - CartItem (один ко многим)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId);

            // Product - CartItem (один ко многим)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId);

            // User - UserFavorite (один ко многим)
            modelBuilder.Entity<UserFavorite>()
                .HasOne(uf => uf.User)
                .WithMany(u => u.FavoriteProducts)
                .HasForeignKey(uf => uf.UserId);

            // Product - UserFavorite (один ко многим)
            modelBuilder.Entity<UserFavorite>()
                .HasOne(uf => uf.Product)
                .WithMany(p => p.UserFavorites)
                .HasForeignKey(uf => uf.ProductId);

            // Индексы для оптимизации
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Category);
                
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Brand);
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }