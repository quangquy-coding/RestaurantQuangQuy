using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace RestaurantQuangQuy.Services
{
	public class EmailSettings
	{
		public string SmtpServer { get; set; } = null!;
		public int SmtpPort { get; set; }
		public string SenderName { get; set; } = null!;
		public string SenderEmail { get; set; } = null!;
		public string Password { get; set; } = null!;
	}


	public interface IEmailService
	{
		Task SendEmailAsync(string toEmail, string subject, string body);
	}

	public class EmailService : IEmailService
	{
		private readonly EmailSettings _emailSettings;

		public EmailService(IOptions<EmailSettings> emailSettings)
		{
			_emailSettings = emailSettings.Value;
		}
		public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(toEmail))
					throw new ArgumentException("Email người nhận không được để trống hoặc null", nameof(toEmail));

				if (string.IsNullOrWhiteSpace(_emailSettings.SenderEmail))
					throw new ArgumentException("Email người gửi không được để trống hoặc null", nameof(_emailSettings.SenderEmail));

				Console.WriteLine($"Sending email to: {toEmail}, Subject: {subject}");

				var message = new MailMessage();
				message.To.Add(new MailAddress(toEmail));
				message.Subject = subject;
				message.Body = htmlMessage;
				message.IsBodyHtml = true;
				message.From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName);

				using var smtp = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
				{
					Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.Password),
					EnableSsl = true
				};

				await smtp.SendMailAsync(message);
				Console.WriteLine($"Email sent successfully to: {toEmail}");
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Failed to send email: {ex.Message}");
				throw;
			}
		}
	}
}
