export default function UsersPage() {
  return <TablePage title="Users" columns={["Name", "Email", "Role", "Action"]} rows={[["Amina", "amina@example.com", "CUSTOMER", "Suspend"], ["Omar", "omar@example.com", "COOK", "Unsuspend"]]} />;
}

function TablePage({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return <><h1>{title}</h1><table className="table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></>;
}
