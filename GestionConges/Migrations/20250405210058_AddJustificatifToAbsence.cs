using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionConges.Migrations
{
    /// <inheritdoc />
    public partial class AddJustificatifToAbsence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "JustificatifPath",
                table: "Absences",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JustificatifPath",
                table: "Absences");
        }
    }
}
