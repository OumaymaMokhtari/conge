using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;

namespace GestionConges.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScannerController : ControllerBase
    {
        [HttpPost]
        public IActionResult Post([FromBody] ImageRequest request)
        {
            try
            {
                // 🔽 Nettoyage du base64
                var base64 = Regex.Replace(request.ImageBase64, "^data:image\\/[a-zA-Z]+;base64,", string.Empty);
                var bytes = Convert.FromBase64String(base64);

                // 📁 Dossier "captures"
                var dossier = @"C:\Users\oumayma\source\repos\ReconnaissanceAbsence\captures";
                if (!Directory.Exists(dossier))
                    Directory.CreateDirectory(dossier);

                var cheminImage = Path.Combine(dossier, "aujourdhui.jpg");
                System.IO.File.WriteAllBytes(cheminImage, bytes);

                // ▶️ Lancer le script Python
                var psi = new ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = $"\"C:\\Users\\oumayma\\source\\repos\\ReconnaissanceAbsence\\reconnaissance_absence.py\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                var process = Process.Start(psi);
                return Ok("Image reçue et script lancé !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur : {ex.Message}");
            }
        }

        public class ImageRequest
        {
            public string ImageBase64 { get; set; }
        }
    }
}
