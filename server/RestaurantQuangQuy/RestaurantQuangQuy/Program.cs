using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;
using System.Text;
using RestaurantQuangQuy.Helpers;



var builder = WebApplication.CreateBuilder(args);



// 1. Cấu hình DbContext
builder.Services.AddDbContext<RestaurantManagementContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IVNPayService, VNPayService>();
// 2. Cấu hình Email Service
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();


// 3. Cấu hình JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
string jwtKey = jwtSettings["Key"] ?? throw new Exception("JWT Key missing in configuration");
string jwtIssuer = jwtSettings["Issuer"];
string jwtAudience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = jwtIssuer,
		ValidAudience = jwtAudience,
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
	};
});



// 4. Cấu hình Authorization
builder.Services.AddAuthorization();

// 5. Cấu hình Swagger (bao gồm Bearer Token support)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "Restaurant API",
		Version = "v1",
		Description = "API for managing restaurant orders"
	});

	options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		In = ParameterLocation.Header,
		Description = "Nhập JWT token vào đây (Bearer <token>)",
		Name = "Authorization",
		Type = SecuritySchemeType.ApiKey,
		Scheme = "Bearer"
	});

	options.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			Array.Empty<string>()
		}
	});

	// Thêm dòng này để tránh trùng tên schema
	options.CustomSchemaIds(type => type.FullName);
});


// 6. CORS (cho phép tất cả - tùy chỉnh lại nếu cần)
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", builder =>
	{
		builder.AllowAnyOrigin()
			   .AllowAnyMethod()
			   .AllowAnyHeader();
	});
});

builder.Services.AddControllers();
builder.Services.AddMemoryCache();


var app = builder.Build();

// 7. Middleware pipeline
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
	app.UseSwagger();
	app.UseSwaggerUI(options =>
	{
		options.SwaggerEndpoint("/swagger/v1/swagger.json", "Restaurant API v1");
	});
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

app.MapControllers();

app.Run();
