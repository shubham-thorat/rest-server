wrk.method = "POST"
wrk.body   = string.format("key=rest_client_key&value=rest_client_value")
wrk.headers["Content-Type"] = "application/x-www-form-urlencoded"
wrk.path = "/"

done = function(summary, latency, requests)
   io.write("\nJSON Output:\n")
   io.write("{\n")
   io.write(string.format("\t\"requests\": %d,\n", summary.requests))
   io.write(string.format("\t\"duration_in_microseconds\": %0.2f,\n", summary.duration))
   io.write(string.format("\t\"bytes\": %d,\n", summary.bytes))
   io.write(string.format("\t\"requests_per_sec\": %0.2f,\n", (summary.requests/summary.duration)*1e6))
   io.write(string.format("\t\"bytes_transfer_per_sec\": %0.2f,\n", (summary.bytes/summary.duration)*1e6))
--    io.write(string.format("\t\"minimum_latency_in_microseconds\": %0.2f,\n", latency.min))
--    io.write(string.format("\t\"maximum_latency_in_microseconds\": %0.2f,\n", latency.max))

   io.write("\t\"latency_distribution\": [\n")
   for _, p in pairs({ 50, 90, 99, 99.9}) do
      io.write("\t\t{\n")
      n = latency:percentile(p)
      io.write(string.format("\t\t\t\"percentile\": %g,\n\t\t\t\"latency_in_microseconds\": %d\n", p, n))
      if p == 100 then 
          io.write("\t\t}\n")
      else 
          io.write("\t\t},\n")
      end
   end
   io.write("\t]\n}\n")
end