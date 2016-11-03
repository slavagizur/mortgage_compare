package ru.gizur.apps.financial.morgage.compare;

import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "MortgageServlet", urlPatterns = "/mortgage/*")
public class MortgageServlet extends javax.servlet.http.HttpServlet {

    private static final double PERCENT = 11.5;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String rawInitAmount = request.getParameter("initAmount");
        if (rawInitAmount == null || rawInitAmount.isEmpty()) {
            return;
        }
        String rawMonthCount = request.getParameter("monthCount");
        if (rawMonthCount == null || rawMonthCount.isEmpty()) {
            return;
        }
        String rawTotalMonthCount = request.getParameter("totalMonthCount");
        if (rawTotalMonthCount == null || rawTotalMonthCount.isEmpty()) {
            return;
        }
        int totalMonthCount = Integer.parseInt(rawTotalMonthCount);
        int monthCount = Integer.parseInt(rawMonthCount);
        JSONObject result = new JSONObject();
        JSONArray rows = new JSONArray();
        long curAmount = 100L * Integer.parseInt(rawInitAmount), curPercent;
        JSONObject curRow;
        for (int monthRow = 0; monthRow < monthCount; monthRow++) {
            long monthAmount = getMonthAmount(curAmount, totalMonthCount - monthRow);
            long getToPay = getToPay(request, monthRow);
            curPercent = getPercentCalculated(monthAmount, PERCENT, curAmount, 1);
            curRow = new JSONObject();
            curRow.put("monthAmount", monthAmount);
            curRow.put("percentAmount", curPercent);
            curAmount += (curPercent - getToPay);
            rows.put(curRow);
        }
        result.put("rows", rows);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.addHeader("Access-Control-Allow-Origin", "*");
        PrintWriter writer = response.getWriter();
        writer.write(result.toString());
        writer.flush();
    }

    private long getToPay(HttpServletRequest request, int monthRow) {
        String rawToPay = request.getParameter("toPay" + monthRow);
        if (rawToPay == null || rawToPay.isEmpty()) {
            return 0L;
        }
        return 100L * Integer.parseInt(rawToPay);
    }

    private long getMonthAmount(long amount, int monthCount) {
        long increaseAmount = 100_000L * 100L, curAmount = 0;
        double realPercent = PERCENT;
        while (increaseAmount > 0) {
            curAmount += increaseAmount;
            long calculated = getCalculated(curAmount, realPercent, amount, monthCount);
            if (calculated < 0) {
                curAmount -= increaseAmount;
                increaseAmount /= 10L;
            }
        }
        return curAmount;
    }

    private long getCalculated(long curAmount, double realPercent, long amount, long monthCount) {
        long calculated = amount, curPercent;
        int monthDays[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        for (int months = 0; months < monthCount; months++) {
            curPercent = (long) (calculated * realPercent / 100L / 365L * monthDays[months % 12]);
            calculated -= (curAmount - curPercent);
        }
        return calculated;
    }

    private long getPercentCalculated(long curAmount, double realPercent, long amount, long monthCount) {
        long calculated = amount, curPercent = 0;
        int monthDays[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        for (int months = 0; months < monthCount; months++) {
            curPercent = (long) (calculated * realPercent / 100L / 365L * monthDays[months % 12]);
            break;
        }
        return curPercent;
    }
}
