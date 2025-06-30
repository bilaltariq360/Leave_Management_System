using LeaveManagementSystem.api.Model;
using LeaveManagementSystem.api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CompanyContext>(options =>
{
    options.UseSqlServer("Server=ZEUS\\SQLEXPRESS;Database=LeaveManagementDB;Trusted_Connection=True;TrustServerCertificate=True;");
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddTransient<IEmailService, EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors(origin => {
    origin.AllowAnyHeader();
    origin.AllowAnyMethod();
    origin.AllowAnyOrigin();
});

app.Run();
